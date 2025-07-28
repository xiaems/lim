export type AddLocationDetailsProps = {
  userName : string; 
  countryCode : string, 
  phoneNumber : number,  
  email  :string;
  referralID : string;
}

export type ticketDataProps = {
  value : number | any
}

export type RootStackParamList = {
  Splash: undefined;
  SignIn: undefined;
  OtpVerification: undefined;
  SignUp: undefined;
  AddNewLocation: undefined;
  Notifications: undefined;
  EmptyNotification: undefined;
  HomeScreen: undefined;
  DateTimeSchedule: undefined;
  ProfileSetting: undefined;
  EditProfile: undefined;
  PromoCodeScreen: undefined;
  BankDetail: undefined;
  SavedLocation: undefined;
  MyTabs: undefined;
  AppPageScreen: undefined;
  CompleteRideScreen: undefined;
  CancelRideScreen: undefined;
  PendingRideScreen: undefined;
  SelectRide: undefined;
  DriverDetails: undefined;
  FindingDriver: undefined;
  Onboarding: undefined;
  OutStation: undefined;
  LocationDrop: undefined;
  ChooseRider: undefined;
  BookRide: undefined;
  CancelRide: undefined;
  CancelFare: undefined;
  AddNewRider: undefined;
  OnTheWayDetails: undefined;
  DriverInfos: undefined;
  ChatScreen: undefined;
  RideActive: undefined;
  Payment: undefined;
  Calander: undefined;
  Share: undefined;
  OtpVerify: undefined;
  ResetPassword: undefined;
  SignInWithMail: undefined;
  AddLocationDetails: undefined | AddLocationDetailsProps ;
  CompleteRide: undefined;
  LocationSelect: undefined;
  ActiveRideScreen: undefined;
  ScheduleRideScreen: undefined;
  Rental: undefined;
  Outstation: undefined;
  Ride: undefined;
  ChooseRiderScreen: undefined;
  PaymentRental: undefined;
  Wallet: undefined;
  PaymentMethod: undefined;
  PromoCodeDetail: undefined;
  AddLocation: undefined;
  TopUpWallet: undefined;
  HomeService: undefined;
  PaymentWebView: undefined;
  RentalLocation: undefined;
  RentalLocationSearch: undefined;
  LocationSave: undefined;
  RentalBooking: undefined;
  RentalVehicleSelect: undefined;
  CreateTicket: undefined;
  SupportTicket: undefined;
  TicketDetails: undefined | ticketDataProps ;
  RentalCarDetails: undefined;
  Profile: undefined;
  NoService:undefined;

};
