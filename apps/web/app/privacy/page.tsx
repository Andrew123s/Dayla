import React from 'react';
import StaticPage from '../../components/StaticPage';

const PrivacyPage: React.FC = () => {
  return (
    <StaticPage title="Privacy Policy">
      <p>
        Dayla is committed to protecting your personal information. We only collect data
        necessary to provide our services, such as account information, trip details, and
        preferences you choose to share. We do not sell your data to third parties.
      </p>
      <p>
        Your information is stored securely and used solely to improve your Dayla experience,
        including trip planning, eco-tracker to track carbon footprint, collaboration features,
        and personalized recommendations.
      </p>
      <p>You may request deletion of your account and associated data at any time.</p>
    </StaticPage>
  );
};

export default PrivacyPage;
