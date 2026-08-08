import React from 'react';
import { FiNavigation } from 'react-icons/fi';

export const OfficeMap = () => {
  return (
    <div className="glass-card office-map-container">
      <div className="office-map-visual">
       <iframe
  title="SkillTrack AI HQ Map"
  src="https://www.google.com/maps?q=Hyderabad,Telangana,India&output=embed"
  width="100%"
  height="100%"
  style={{ border: 0 }}
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
/>
        <div className="map-location-badge">
          <FiNavigation style={{ color: 'var(--color-primary)' }} />
          <span>SkillTrack AI HQ — Hyderabad, India</span>
        </div>
      </div>
    </div>
  );
};

export default OfficeMap;