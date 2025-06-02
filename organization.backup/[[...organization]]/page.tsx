'use client'

import { OrganizationProfile } from '@clerk/nextjs';
import { useState } from 'react';

function SafeClerkComponent({ component: Component, ...props }) {
  const [error, setError] = useState(null);

  if (error) {
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50 text-red-800">
        <h2 className="text-lg font-semibold mb-2">Error Loading Component</h2>
        <p className="mb-3">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={() => setError(null)}
          className="btn-neumorphic bg-red-100 text-red-700 hover:bg-red-200"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div onError={(e) => {
      e.preventDefault();
      setError(e.error);
    }}>
      <Component {...props} />
    </div>
  );
}

export default function OrganizationPage() {
  // Prevent entire page from crashing with a basic error state
  const [pageError, setPageError] = useState(null);

  if (pageError) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="p-4 border border-red-300 rounded bg-red-50 text-red-800">
          <h2 className="text-lg font-semibold mb-2">Error Loading Organization Page</h2>
          <p className="mb-3">{pageError.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => setPageError(null)}
            className="btn-neumorphic bg-red-100 text-red-700 hover:bg-red-200"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Use try-catch to handle errors at the page level
  try {
    return (
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 text-[#DA7756]">Organization Settings</h1>
          <p className="text-[#333333]">
            Manage your organization preferences and members
          </p>
        </div>

        {/* Organization Profile */}
        <div className="card-neumorphic">
          {<OrganizationProfile
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
                organizationProfile: "gap-4",
                formButtonPrimary: "btn-neumorphic btn-primary",
                formFieldInput: "input-neumorphic",
                formField: "mb-4",
                navbarButton: "nav-link text-[#333333] hover:text-[#DA7756]",
                organizationProfilePage: "gap-4",
                organizationSectionContent: "gap-4",
                organizationSectionTitle: "text-[#DA7756] text-lg font-medium mb-2",
                organizationSectionPrimaryButton: "btn-neumorphic btn-primary",
                avatarBox: "border-2 border-[#DA7756]",
                organizationPreviewTextContainer: "text-[#333333]",
                organizationSwitcherPopoverActionButtonText: "text-[#333333]",
                organizationSwitcherPopoverActionButtonIcon: "text-[#DA7756]",
                badge: "bg-[#DA7756]",
              }
            }}
          />}
        </div>
      </div>
    );
  } catch (error) {
    // Only runs on initial render errors, not for runtime errors after mount
    setPageError(error);
    return null;
  }
}