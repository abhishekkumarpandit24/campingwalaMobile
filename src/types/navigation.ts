// types/navigation.ts

export type RootStackParamList = {
  Drawer: undefined;
  Auth: undefined;
};

export type AuthStackParamList = {
  AuthLanding: undefined;
  UserType: undefined;
  Registration: undefined;
  Login: undefined;
  VendorPendingApproval: undefined;
};

export type DrawerParamList = {
  Home: undefined;
  Requests: undefined;
  SpotDetails: { spotId: string }; // Example
  AddSpot: undefined;
  EditSpot: { spotId: string }; // Example
  ProfileSettings: { user: User }; // 👈 Pass user object here
};

export type User = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  businessName?: string;
  businessAddress?: string;
  businessContact?: string;
};

export type RootStackParamScreen = {
  Home: undefined;
  SpotDetails: { spot: any };
  AddSpot: undefined;
  EditSpot: { spot: any };
};
