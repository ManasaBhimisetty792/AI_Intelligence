import React from 'react';
import { motion } from 'framer-motion';
import microsoft from "../../assets/icons/microsoft.png";
import google from "../../assets/icons/google.jpeg";
import amazon from "../../assets/icons/amazon.jpeg";
import meta from "../../assets/icons/meta.jpeg";
import icims from "../../assets/icons/icims.jpeg";
import techmahendra from "../../assets/icons/tech mahindra.jpeg";
import accenture from "../../assets/icons/accenture.png";
import wipro from "../../assets/icons/wipro.jpeg";
import deloitte from "../../assets/icons/deloitte.jpeg";
import ibm from "../../assets/icons/ibm.png";
import redhat from "../../assets/icons/redhat.png";

const LOGO_PLACEHOLDERS = [
  { name: 'Google', image: google },
  { name: 'Microsoft', image: microsoft },
  { name: 'Amazon', image: amazon },
  { name: 'Meta', image: meta },
  { name: 'ICIMS', image: icims },
  { name: 'Tech Mahendra', image: techmahendra },
  { name: 'Accenture', image: accenture },
  {name:'Wipro', image: wipro},
  {name:'Deloitte', image: deloitte},
  {name:'IBM', image: ibm},
  {name:'Red Hat', image: redhat},
  
];

export const TrustedBySection = () => {
  const logos = [...LOGO_PLACEHOLDERS, ...LOGO_PLACEHOLDERS];

  return (
    <section className="trusted-by-section" id="trusted-by">
      <div className="container">
        <p className="trusted-by-title">
          Trusted by Students, Recruiters, and Educational Institutions Worldwide
        </p>

        <div className="logo-marquee">
          <div className="logo-marquee-track">
            {logos.map((partner, index) => (
              <motion.div
                key={`${partner.name}-${index}`}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (index % LOGO_PLACEHOLDERS.length) * 0.05 }}
                className="partner-logo-pill"
              >
                <img
                  src={partner.image}
                  alt={partner.name}
                  className="partner-logo-image"
                />
                <span className="partner-logo-name">{partner.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBySection;