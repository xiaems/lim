import { View, Text, Image, TouchableOpacity, TouchableWithoutFeedback, TextInput, FlatList, Alert, PermissionsAndroid, Platform } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Header, notificationHelper } from "@src/commonComponent";
import { appColors, appFonts } from "@src/themes";
import Images from "@src/utils/images";
import { Clip, CloseIcon, Download } from "@src/utils/icons";
import styles from "./styles";
import DocumentPicker from "react-native-document-picker";
import { clearValue, getValue } from "@src/utils/localstorage";
import { useDispatch, useSelector } from "react-redux";
import { messageDataGet, ticketDataGet, } from "../../../api/store/actions/ticketAction";
import { URL } from "@src/api/config";
import { useValues } from "@App";
import { external } from "@src/styles/externalStyle";
import RNFS from 'react-native-fs';
import { useNavigation } from "@react-navigation/native";

export function TicketDetails({ route }) {
  const { ticketData } = route.params;
  const { translateData } = useSelector((state) => state.setting);
  const [textViewShow, setTextViewShow] = useState(false);
  const [inputText, setInputText] = useState("");
  const [files, setFiles] = useState([]);
  const { messageData } = useSelector((state: any) => state.tickets);
  const dispatch = useDispatch();
  const { textRTLStyle, viewRTLStyle } = useValues();
  const navigation = useNavigation()


  useEffect(() => {
    const ticket_id = ticketData.id;
    dispatch(messageDataGet({ ticket_id }))
      .unwrap()
      .then((res: any) => {

        if (res.status === 403) {
          notificationHelper('', 'Please log in again.', 'error');
          clearValue('token').then(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'SignIn' }],
            });
          });
        }
      })
      .catch((error) => {
        console.error('Error in messageDataGet:', error);
      });
  }, []);


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDocumentUpload = useCallback(async () => {
    setTextViewShow(true);
    try {
      const response = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true,
      });
      setFiles([...files, ...response]);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert("Error", "Failed to upload file(s).");
      }
    }
  }, [files]);

  const TicketReplay = async () => {
    const forme = {
      message: inputText,
      attachments: files,
      ticket_id: messageData.id,
    };

    setFiles();
    setInputText();
    setTextViewShow(false);
    const token = await getValue("token");
    try {
      const formData = new FormData();

      formData.append("message", forme.message);

      if (forme.attachments && forme.attachments.length > 0) {
        forme.attachments.forEach((file, index) => {
          formData.append(`attachments[${index}]`, {
            uri: file.uri,
            name: file.name || `file-${index}`,
            type: file.type || "application/octet-stream",
          });
        });
      }
      formData.append("ticket_id", forme.ticket_id);

      const response = await fetch(`${URL}/api/ticket/reply`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(ticketDataGet());
      dispatch(messageDataGet({ ticket_id }));

      const responseData = await response.json();
      if (response.ok) {
        dispatch(ticketDataGet());
        dispatch(messageDataGet({ ticket_id: forme.ticket_id }));
      } else {
        notificationHelper('', responseData?.message, 'error');
      }

    } catch (error) {
      notificationHelper('', "Something went wrong. Please try again later.", 'error');
      console.error("TicketReplay error:", error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedTime = `${hours % 12 || 12}:${minutes
      .toString()
      .padStart(2, "0")} ${ampm}`;
    return formattedTime;
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === "android") {
      try {
        const writePermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Storage Permission Required",
            message: "App needs access to storage to download files.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );

        const readPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );

        return (
          writePermission === PermissionsAndroid.RESULTS.GRANTED &&
          readPermission === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn("Permission Error:", err);
        return false;
      }
    }
    return true;
  };


  const handleDownloadFile = async (imageUri) => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert("Permission Denied", "Storage permission is required to download the file.");
        return;
      }

      const fileName = imageUri.split("/").pop();
      const downloadPath =
        Platform.OS === "android"
          ? `${RNFS.DownloadDirectoryPath}/${fileName}`
          : `${RNFS.DocumentDirectoryPath}/${fileName}`;

      const downloadResult = await RNFS.downloadFile({
        fromUrl: imageUri,
        toFile: downloadPath,
      }).promise;

      if (downloadResult.statusCode === 200) {
        Alert.alert("Download Complete", `File saved to ${downloadPath}`);
      } else {
        Alert.alert("Download Failed", "Something went wrong while downloading.");
      }
    } catch (error) {
      console.error("Download Error:", error);
      Alert.alert("Error", "Failed to download image.");
    }
  };


  const renderItem = ({ item }: { item: any }) => (
    (
      <View style={styles.cardContainer}>
        <View style={[{ flexDirection: viewRTLStyle }]}>
          <View style={[styles.userInfoContainer, { flexDirection: viewRTLStyle }]}>
            <Image source={Images.user} style={styles.userImage} />
            <View style={styles.userTextContainer}>
              <Text style={styles.userName}>{item?.name}</Text>
              <Text style={styles.date}>{formatDate(item?.created_at)}</Text>
            </View>
          </View>
          <View style={styles.ticketContainer}>
            <Text style={styles.ticketId}>#{ticketData?.ticket_number}</Text>
          </View>
        </View>
        <View>
          <Text style={styles.description}>{item?.message}</Text>
          <View>
            <View
              style={[styles.downloadFileView, {
                flexDirection: viewRTLStyle
              }]}
            >
              {item?.media?.map((file, index) => {
                const fileSize = file.size;
                const sizeFormatted =
                  fileSize < 1024
                    ? `${fileSize} B`
                    : fileSize < 1024 * 1024
                      ? `${(fileSize / 1024).toFixed(2)} KB`
                      : fileSize < 1024 * 1024 * 1024
                        ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB`
                        : `${(fileSize / (1024 * 1024 * 1024)).toFixed(2)} GB`;


                return (
                  <View
                    key={index}
                    style={[
                      styles.imageContainer,
                      { flexDirection: viewRTLStyle },
                    ]}
                  >
                    <Image
                      style={styles.image}
                      source={{ uri: file.original_url }}
                    />
                    <View style={styles.filenameView}>
                      <Text
                        style={{
                          color: appColors.primaryText,
                          fontFamily: appFonts.regular,
                        }}
                      >
                        {file.name.length > 5
                          ? `${file.name.substring(0, 5)}...`
                          : file.name}
                      </Text>
                      <Text style={styles.textStyle}>{sizeFormatted}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDownloadFile(file.original_url)} activeOpacity={0.7}
                    >
                      <Download />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
          <Text style={styles.time}>{formatTime(item?.created_at)}</Text>
        </View>
      </View>
    )
  );

  return (
    <View style={external.main}>
      <Header value={translateData.ticketDetails} />
      <View style={styles.listView}>
        <FlatList
          data={messageData?.messages}
          keyExtractor={(item) => item?.id}
          renderItem={renderItem}
        />
      </View>
      <TouchableWithoutFeedback
        onPress={() => {
          setTextViewShow(true);
        }}
      >
        <View style={styles.bottomView}>
          {textViewShow && (
            <View style={styles.textView}>
              <TextInput
                style={styles.inputView}
                placeholder={translateData.type}
                placeholderTextColor={appColors.regularText}
                value={inputText}
                onChangeText={(text) => setInputText(text)}
                autoFocus={true}
                multiline={true}
              />

              <View style={[styles.rowStyles, { flexDirection: textRTLStyle }]}>
                {files?.map((file, index) => {
                  const fileSize = file.size;
                  const sizeFormatted =
                    fileSize < 1024
                      ? `${fileSize} B`
                      : fileSize < 1024 * 1024
                        ? `${(fileSize / 1024).toFixed(2)} KB`
                        : fileSize < 1024 * 1024 * 1024
                          ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB`
                          : `${(fileSize / (1024 * 1024 * 1024)).toFixed(2)} GB`;

                  const handleRemoveFile = (fileIndex: number) => {
                    const updatedFiles = files.filter(
                      (_, i) => i !== fileIndex
                    );
                    setFiles(updatedFiles);
                  };

                  return (
                    <View
                      key={index}
                      style={[
                        styles.imageContainer,
                        { flexDirection: viewRTLStyle },
                      ]}
                    >
                      <Image
                        style={styles.imageUri}
                        source={{ uri: file.uri }}
                      />
                      <TouchableOpacity
                        onPress={() => handleRemoveFile(index)}
                        style={styles.closeIconView}
                        activeOpacity={0.7}
                      >
                        <CloseIcon />
                      </TouchableOpacity>
                      <View
                        style={styles.fileTextView}
                      >
                        <Text style={styles.fileText}>
                          {file?.name.length > 5
                            ? `${file.name.substring(0, 5)}...`
                            : file.name}
                        </Text>
                        <Text style={styles.formatedText}>{sizeFormatted}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
              <View style={styles.border} />
            </View>
          )}
          <View
            style={[styles.bottomSearchBar, { flexDirection: viewRTLStyle }]}
          >
            <TouchableOpacity
              style={styles.attachment}
              onPress={handleDocumentUpload}
              activeOpacity={0.7}

            >
              <Clip />
            </TouchableOpacity>
            <View style={styles.btnContainer}>
              <TouchableOpacity style={styles.sendBtn} onPress={TicketReplay} activeOpacity={0.7}
              >
                <Text style={styles.btnTitle}>{translateData.send}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}
