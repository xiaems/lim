import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Pressable, Image, Keyboard } from 'react-native';
import { commonStyles } from '../../styles/commonStyle';
import { external } from '../../styles/externalStyle';
import { Back, Send, Mic, Emoji } from '@utils/icons';
import { appColors } from '@src/themes';
import { useValues } from '../../../App';
import { styles } from './styles';
import EmojiPicker from 'rn-emoji-keyboard';
import Voice from '@react-native-voice/voice';
import Images from '@utils/images';
import { useAppNavigation } from '@src/utils/navigation';
import '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import { useRoute, useTheme } from '@react-navigation/native';
import { useSelector } from 'react-redux';

export function ChatScreen() {
  const { goBack } = useAppNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { driverId, riderId, rideId, driverName, driverImage, from } = route.params || {};
  const [isOpen, setIsOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [opacity, setOpacity] = useState(1);
  const { translateData } = useSelector(state => state.setting);
  const { self } = useSelector((state: any) => state.account);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState<string>('');
  const flatListRef = useRef<FlatList>(null)
  const { bgFullStyle, bgFullLayout, textColorStyle, viewRTLStyle, textRTLStyle, bgContainer, isDark, isRTL } = useValues();
  const inputRef = useRef<TextInput>(null);
  const [isMessagesFetched, setIsMessagesFetched] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      scrollToBottom
    )
    return () => {
      keyboardDidShowListener.remove()
    }
  }, [messages])

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true })
    }
  }


  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const amPM = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${amPM}`;
  };

  const handlePick = (emoji: { emoji: string }): void => {
    if (emoji && emoji.emoji) {
    }
  };

  const onSpeechStart = () => {
    setStarted(true);
  };

  const onSpeechEnd = () => {
    setStarted(false);
  };

  const onSpeechResults = (e: any) => {
    if (e.value && e.value.length > 0) {
      setResults(e.value);
    }
  };

  const startRecognizing = async () => {
    setOpacity(0.7);
    try {
      await Voice.start('en-US');
      setResults([]);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecognizing = async () => {
    setOpacity(1);
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const ride_Id = `${rideId}`;
  const currentUserId = `${riderId}`;
  const chatWithUserId = `${driverId}`;
  const adminId = 1;

  const chatId =
    from && from === 'help'
      ? [adminId, currentUserId].sort().join('_')
      : [ride_Id, currentUserId, chatWithUserId].sort().join('_');

  const messagesRef = firestore()
    .collection('chats')
    .doc(chatId)
    .collection('messages');

  useEffect(() => {
    const unsubscribeMessages = messagesRef
      .orderBy('timestamp', 'asc')
      .onSnapshot(
        snapshot => {
          const fetchedMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessages(fetchedMessages);
          setIsMessagesFetched(true);
        },
      );

    return () => {
      unsubscribeMessages();
    };
  }, [chatId]);


  const sendMessage = async () => {
    if (from === "help") {
      if (input.trim()) {
        const messageData = {
          message: input,
          senderId: currentUserId,
          timestamp: firestore.FieldValue.serverTimestamp(),
        };

        const lastMessageData = {
          message: input,
          senderId: currentUserId,
          senderName: self && self?.name,
          receiverName: "administrator",
          timestamp: firestore.FieldValue.serverTimestamp(),
        };
        setInput('')
        const participants = [String(adminId), currentUserId]
        const unreadCount = { 1: 1, [currentUserId]: 0 }

        try {
          await messagesRef.add(messageData);
          await firestore()
            .collection('chats')
            .doc(chatId)
            .set({ lastMessage: lastMessageData, participants: participants, unreadCount: unreadCount });

          setInput('');
        } catch (error) {
        }
      }
    } else {
      if (input.trim()) {
        try {
          await messagesRef.add({
            message: input,
            senderId: currentUserId,
            timestamp: firestore.FieldValue.serverTimestamp(),
          });
          setInput('');
        } catch (error) {
        }
      }
    }
  };


  return (
    <View style={[commonStyles.flexContainer]}>
      <View
        style={[
          styles.view_Main,
          { backgroundColor: bgFullStyle, flexDirection: viewRTLStyle },
        ]}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.backButton,
            { borderColor: isDark ? appColors.darkBorder : appColors.border },
            { backgroundColor: isDark ? bgContainer : appColors.lightGray },
          ]}
          onPress={goBack}>
          <Back />
        </TouchableOpacity>
        <View style={[external.mh_10, external.fg_1]}>
          <Text
            style={[
              styles.templetionStyle,
              { color: textColorStyle, textAlign: textRTLStyle },
            ]}>
            {from && from === "help" ? "Administrator" : driverName}
          </Text>
          <Text
            style={[
              commonStyles.mediumTextBlack12,
              external.mt_2,
              { color: appColors.primary, textAlign: textRTLStyle },
            ]}>
            {translateData.online}
          </Text>
        </View>
      </View>
      <FlatList
        data={messages}
        ref={flatListRef}
        keyExtractor={item => item.id}
        style={styles.listStyle}
        renderItem={({ item }) => {
          const timestamp = item.timestamp
            ? new Date(item.timestamp.seconds * 1000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
            : 'Sending...';

          return (
            <View
              style={[
                styles.mainView,
                {
                  flexDirection: item.senderId === currentUserId ? 'row-reverse' : 'row',
                },
              ]}
            >
              {item.senderId !== currentUserId && (
                <Image
                  source={driverImage ? { uri: driverImage } : Images.defultImage}
                  style={[
                    styles.imageStyle,
                    {
                      borderColor: colors.border,
                    },
                  ]}
                />
              )}

              <View
                style={[
                  styles.messageContainer,
                  item.senderId === currentUserId
                    ? styles.senderMessage
                    : styles.receiverMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    item.senderId !== currentUserId
                      ? styles.senderMessageText
                      : styles.receiverMessageText,
                    { textAlign: isRTL ? 'right' : 'left' },
                  ]}
                >
                  {item.message}
                </Text>
                <Text
                  style={[
                    styles.messageText,
                    item.senderId !== currentUserId
                      ? styles.senderMessageTime
                      : styles.receiverMessageTime,
                    { textAlign: isRTL ? 'right' : 'left' },
                  ]}
                >
                  {timestamp}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          isMessagesFetched && messages.length === 0 ? (
            <TouchableOpacity
              onPress={() => inputRef.current?.focus()}
              style={styles.emptyContainer}
              activeOpacity={0.9}
            >
              <Image
                source={Images.noChat}
                style={styles.noChatImage}
                resizeMode="contain"
              />
              <Text style={styles.noChatText}>No Chat yet!</Text>
              <Text style={styles.noChatDetailsText}>
                No chats found. Tap here to start chatting.
              </Text>
            </TouchableOpacity>
          ) : null
        }

      />

      <View
        style={[
          styles.inputContainer,
          { backgroundColor: bgFullLayout },
          { flexDirection: viewRTLStyle },
        ]}>
        <View
          style={[
            styles.textInputView,
            {
              backgroundColor: bgFullStyle,
              flexDirection: viewRTLStyle,
            },
          ]}>
          <View style={styles.inputView}>
            <TouchableOpacity style={styles.emojiView} activeOpacity={0.7} onPress={() => setIsOpen(true)}>
              <Emoji />
            </TouchableOpacity>
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                { textAlign: textRTLStyle },
                { color: textColorStyle },
              ]}
              value={input}
              onChangeText={setInput}
              placeholder={translateData.typeHere}
              multiline
              placeholderTextColor={appColors.subtitle}
            />
          </View>
          <View style={styles.sendBtnView}>
            <Pressable
              style={[{ opacity: opacity }]}
              onPressIn={startRecognizing}
              onPressOut={stopRecognizing}>
              <Mic />
            </Pressable>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendMessage}
              activeOpacity={0.7}>
              <Send />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {isOpen && (
        <View>
          <EmojiPicker
            onEmojiSelected={handlePick}
            open={isOpen}
            onClose={() => setIsOpen(false)}
          />
        </View>
      )}
    </View>
  );
}
