import { UserProfile } from "@clerk/nextjs";

const ProfilePage = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-[#DA7756]">Profile Settings</h1>
        <p className="text-[#333333]">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Card */}
      <div className="card-neumorphic">
        <UserProfile
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "w-full shadow-none",
              navbar: "w-full h-12",
              pageScrollBox: "max-h-[calc(100vh-200px)] overflow-auto",
              page: "flex justify-center items-center",
              main: "w-full",
              card__main: "p-6",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              profileSection: "card-neumorphic p-6 mb-6",
              formButtonPrimary: "btn-neumorphic btn-primary",
              formFieldInput: "input-neumorphic",
              formField: "mb-4",
              navbarButton: "nav-link",
              profilePage: "gap-6",
              profileSectionContent: "gap-4",
              profileSectionTitle: "text-[#DA7756] text-lg font-medium mb-4",
              profileSectionPrimaryButton: "btn-neumorphic btn-primary",
              avatarBox: "border-2 border-[#DA7756]",
              badge: "bg-[#DA7756]",
              navbar: "bg-transparent",
              navbarButton: "text-[#333333] hover:text-[#DA7756]",
              profileSectionContent__emailAddresses: "space-y-4",
              profileSectionContent__phoneNumbers: "space-y-4",
              profileSectionContent__connectedAccounts: "space-y-4",
              formFieldLabel: "text-[#333333] font-medium",
              formFieldLabelRow: "mb-2",
              formFieldInput: "input-neumorphic",
              formFieldError: "text-red-500 text-sm mt-1",
              formButtonReset: "btn-neumorphic",
              formResendCodeLink: "text-[#DA7756] hover:opacity-80",
              formFieldSuccessText: "text-green-500 text-sm mt-1",
              identityPreview: "bg-[#F5F5F5] p-4 rounded-lg",
            },
            layout: {
              socialButtonsPlacement: "bottom",
              socialButtonsVariant: "blockButton",
            }
          }}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
