import React from 'react';
import StaticPage from '../../components/StaticPage';

const TermsPage: React.FC = () => {
  return (
    <StaticPage title="Terms & Conditions">
      <p>
        By using Dayla, you agree to use the platform responsibly and only for lawful purposes.
        You must not misuse the service, attempt unauthorized access, or disrupt platform
        functionality.
      </p>
      <p>
        All content, branding, and features within Dayla are the property of Dayla and may not be
        copied or redistributed without permission.
      </p>
      <p>
        Dayla is provided “as-is” without guarantees, and we are not liable for losses resulting
        from misuse or service interruptions.
      </p>
    </StaticPage>
  );
};

export default TermsPage;
