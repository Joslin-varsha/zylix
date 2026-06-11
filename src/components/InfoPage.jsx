import React from 'react';
import { MapPin, Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';

const COMPANY = {
  name: 'Zylix 3D',
  website: 'www.zen3d.in',
  phone: '+91 96299 35467',
  email: 'support@zen3d.in',
  address: 'Ajin.R, Mulagumoodu, 47A Tharavillai, Mulagumoodu P.O – 629167',
  hours: 'Monday – Saturday: 9:00 AM – 7:00 PM | Sunday: Closed',
};

const sectionStyle = {
  marginBottom: '2rem',
};

const h2Style = {
  fontSize: '1.05rem',
  fontWeight: '800',
  color: '#000',
  marginBottom: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderLeft: '3px solid #000',
  paddingLeft: '0.75rem',
};

const pStyle = {
  fontSize: '0.88rem',
  color: '#444',
  lineHeight: '1.8',
  marginBottom: '0.5rem',
};

const liStyle = {
  fontSize: '0.88rem',
  color: '#444',
  lineHeight: '1.8',
  marginLeft: '1.25rem',
  marginBottom: '0.25rem',
  listStyleType: 'disc',
};

function ContactBox() {
  return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem',
      marginTop: '1rem',
    }}>
      <p style={{ fontWeight: '700', fontSize: '0.85rem', color: '#000', marginBottom: '0.25rem' }}>{COMPANY.name}</p>
      {[
        { icon: <MapPin size={13} />, text: COMPANY.address },
        { icon: <Phone size={13} />, text: COMPANY.phone },
        { icon: <Mail size={13} />, text: COMPANY.email },
      ].map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: '#555', fontSize: '0.82rem' }}>
          <span style={{ marginTop: '2px', flexShrink: 0 }}>{item.icon}</span>
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// PAGE: About Us
// ─────────────────────────────────────────
function AboutPage() {
  return (
    <div>
      <div style={sectionStyle}>
        <p style={pStyle}>
          <strong>{COMPANY.name}</strong> is a creative 3D printing company and an online gift store dedicated to delivering innovative products and personalized gifting solutions. We combine advanced 3D printing technology with creativity to produce unique, high-quality items for individuals, businesses, and special occasions.
        </p>
        <p style={pStyle}>
          At {COMPANY.name}, we specialize in 3D printing services, custom-designed products, and ready-to-order gift items. From personalized gifts and custom models to functional and decorative 3D-printed products, we focus on quality, precision, and customer satisfaction.
        </p>
        <p style={pStyle}>
          Our online platform, <strong>{COMPANY.website}</strong>, makes it easy for customers to explore, customize, and order creative gift items from the comfort of their homes. Every product is designed and manufactured with attention to detail, ensuring durability, originality, and a premium finish.
        </p>
        <p style={pStyle}>
          We believe that gifts should be meaningful and memorable. By blending technology with creativity, {COMPANY.name} helps customers turn ideas into tangible products that create lasting impressions.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>What We Offer</h2>
        <ul>
          {['3D Printing Services', 'Custom 3D Models & Prototypes', 'Personalized & Customized Gifts', 'Ready-Made Gift Items', 'Corporate & Bulk Gift Solutions'].map((item, i) => (
            <li key={i} style={liStyle}>{item}</li>
          ))}
        </ul>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>Why Choose {COMPANY.name}</h2>
        <ul>
          {['Advanced 3D printing technology', 'Customization-focused approach', 'High-quality materials & finishes', 'Affordable pricing', 'Timely production & delivery'].map((item, i) => (
            <li key={i} style={liStyle}>{item}</li>
          ))}
        </ul>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>Support Us</h2>
        <p style={pStyle}>
          At {COMPANY.name}, your support helps us grow, innovate, and continue delivering high-quality 3D printing services and unique gift products. Every order, review, and recommendation motivates us to create better designs and improved customer experiences.
        </p>
        <ul>
          {[
            'Shop with Us: Purchase our 3D printed products and gift items from our website.',
            'Choose Custom Designs: Order personalized or custom-made 3D products and gifts.',
            'Share & Recommend: Tell your friends, family, and colleagues about us.',
            'Leave a Review: Your feedback helps us improve and build trust with new customers.',
            'Partner with Us: Collaborate with us for corporate gifting, bulk orders, or custom projects.',
          ].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
        </ul>
        <p style={{ ...pStyle, marginTop: '0.75rem', fontStyle: 'italic', color: '#555' }}>
          At {COMPANY.name}, we don't just print products — we create personalized experiences and meaningful gifts.
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>Contact</h2>
        <ContactBox />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// PAGE: Contact Us
// ─────────────────────────────────────────
function ContactPage() {
  return (
    <div>
      <p style={pStyle}>We'd love to hear from you! Whether you have a question about our 3D printing services, customized gifts, bulk orders, or need support, feel free to get in touch with us.</p>
      <div style={sectionStyle}>
        <h2 style={h2Style}>Get in Touch</h2>
        <ContactBox />
      </div>
      <div style={sectionStyle}>
        <h2 style={h2Style}>Business Hours</h2>
        <p style={pStyle}>{COMPANY.hours}</p>
        <p style={pStyle}>You can contact us via phone or email, and we'll get back to you as soon as possible.</p>
        <p style={{ ...pStyle, fontStyle: 'italic' }}>At {COMPANY.name}, your ideas matter — let's turn them into reality.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// PAGE: Privacy Policy
// ─────────────────────────────────────────
function PrivacyPage() {
  return (
    <div>
      <p style={pStyle}>At {COMPANY.name}, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit or make a purchase from {COMPANY.website}.</p>
      {[
        {
          title: 'Information We Collect', items: ['Name, phone number, email address', 'Shipping and billing address', 'Order details and customization requirements', 'Communication details when you contact us']
        },
        {
          title: 'How We Use Your Information', items: ['Process and deliver orders', 'Provide customer support', 'Communicate order updates and service-related information', 'Improve our products, services, and website experience']
        },
      ].map((sec, i) => (
        <div key={i} style={sectionStyle}>
          <h2 style={h2Style}>{sec.title}</h2>
          <ul>{sec.items.map((item, j) => <li key={j} style={liStyle}>{item}</li>)}</ul>
        </div>
      ))}
      <div style={sectionStyle}>
        <h2 style={h2Style}>Data Protection</h2>
        <p style={pStyle}>{COMPANY.name} takes appropriate security measures to protect your personal data from unauthorized access, alteration, disclosure, or misuse. We do not sell, trade, or rent your personal information to third parties.</p>
      </div>
      <div style={sectionStyle}>
        <h2 style={h2Style}>User Rights</h2>
        <ul>
          {['Request access to your personal data', 'Request correction or deletion of your information', 'Opt out of promotional communications'].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
        </ul>
      </div>
      <div style={sectionStyle}>
        <h2 style={h2Style}>Contact Us</h2>
        <p style={pStyle}>If you have any questions or concerns regarding this Privacy Policy, please contact us:</p>
        <ContactBox />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// PAGE: Terms & Conditions
// ─────────────────────────────────────────
function TermsPage() {
  const sections = [
    { title: 'Use of Website', items: ['By using this website, you confirm that you are at least 18 years old or accessing it under parental supervision.', 'You agree to use this website for lawful purposes only.'] },
    { title: 'Products & Services', items: ['Zylix 3D provides 3D printing services, customized products, and gift items.', 'Product images are for reference only; actual products may slightly vary in color, size, or finish due to the nature of 3D printing.', 'Customized and personalized orders are made based on customer-provided details.'] },
    { title: 'Orders & Payments', items: ['All orders placed are subject to acceptance and availability.', 'Full payment must be made before order processing begins.', 'Zylix 3D reserves the right to cancel or refuse any order at its discretion.'] },
    { title: 'Customization Responsibility', items: ['Customers are responsible for providing accurate customization details (names, designs, text, sizes).', 'Zylix 3D is not responsible for errors caused by incorrect information submitted by the customer.'] },
    { title: 'Shipping & Delivery', items: ['Delivery timelines are estimated and may vary due to production time, courier delays, or unforeseen circumstances.', 'Zylix 3D is not liable for delays caused by third-party delivery services.'] },
    { title: 'Cancellations & Refunds', items: ['Order cancellations and refunds are governed by our Refund and Returns Policy.', 'Customized and 3D printed products cannot be cancelled once production has started.'] },
    { title: 'Intellectual Property', items: ['All content on this website, including logos, designs, text, images, and graphics, is the property of Zylix 3D and may not be used without written permission.', 'Custom designs shared by customers remain their property, but Zylix 3D may display completed work for portfolio or promotional purposes unless requested otherwise.'] },
    { title: 'Limitation of Liability', items: ['Zylix 3D shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.', 'Our liability is limited to the amount paid for the product or service.'] },
    { title: 'Governing Law', items: ['These Terms & Conditions shall be governed and interpreted in accordance with the laws of India.'] },
  ];
  return (
    <div>
      <p style={pStyle}>Welcome to {COMPANY.name}. By accessing or using our website {COMPANY.website}, you agree to comply with and be bound by the following Terms & Conditions. Please read them carefully before using our services.</p>
      {sections.map((sec, i) => (
        <div key={i} style={sectionStyle}>
          <h2 style={h2Style}>{sec.title}</h2>
          <ul>{sec.items.map((item, j) => <li key={j} style={liStyle}>{item}</li>)}</ul>
        </div>
      ))}
      <div style={sectionStyle}>
        <h2 style={h2Style}>Contact Information</h2>
        <ContactBox />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// PAGE: Refund & Returns Policy
// ─────────────────────────────────────────
function RefundPage() {
  const sections = [
    { title: 'Returns', items: ['Due to the customized and made-to-order nature of most 3D printed products and personalized gifts, returns are not accepted unless the product is damaged or defective.', 'Non-customized, ready-made items may be eligible for return within 7 days of delivery, provided they are unused, in original condition, and with original packaging.'] },
    { title: 'Damaged or Defective Products', items: ['If you receive a damaged or defective product, please contact us within 48 hours of delivery.', 'Customers must provide clear photos or videos showing the damage or defect.', 'Once verified, we will arrange a replacement or refund based on the issue.'] },
    { title: 'Refunds', items: ['Approved refunds will be processed within 5–7 business days after verification.', 'Refunds will be credited to the original payment method used during purchase.', 'Shipping charges are non-refundable unless the error occurred from our side.'] },
    { title: 'Order Cancellations', items: ['Orders can be cancelled within 12 hours of placing the order.', 'Customized or 3D printed orders cannot be cancelled once production has started.'] },
    { title: 'Exchanges', items: ['Exchanges are only allowed for defective or damaged products.', 'We do not offer exchanges for change of mind or incorrect details provided by the customer.'] },
  ];
  return (
    <div>
      <p style={pStyle}>At {COMPANY.name}, we aim to ensure complete customer satisfaction. Please read our Refund and Returns Policy carefully before placing an order.</p>
      {sections.map((sec, i) => (
        <div key={i} style={sectionStyle}>
          <h2 style={h2Style}>{sec.title}</h2>
          <ul>{sec.items.map((item, j) => <li key={j} style={liStyle}>{item}</li>)}</ul>
        </div>
      ))}
      <div style={sectionStyle}>
        <h2 style={h2Style}>Contact Us</h2>
        <ContactBox />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// PAGE: Shipping Policy
// ─────────────────────────────────────────
function ShippingPage() {
  const sections = [
    { title: 'Shipping Locations', items: ['We currently ship across India.', 'International shipping may be available on request. Please contact us for details.'] },
    { title: 'Order Processing Time', items: ['Orders are processed after successful payment confirmation.', 'Customized and 3D printed products require additional production time.', 'Order processing time typically ranges from 2–5 business days, depending on product type and customization.'] },
    { title: 'Shipping Time', items: ['Estimated delivery time is 5–10 business days after dispatch.', 'Delivery timelines may vary based on location, courier partner, and unforeseen circumstances.'] },
    { title: 'Shipping Charges', items: ['Shipping charges, if applicable, will be displayed at checkout before payment.', 'Charges may vary based on product size, weight, and delivery location.'] },
    { title: 'Order Tracking', items: ['Once your order is shipped, tracking details will be shared via SMS, email, or WhatsApp.'] },
    { title: 'Damaged Packages', items: ['If you receive a damaged package, please contact us within 48 hours of delivery with photos or videos for verification.', 'Replacement or refund will be processed as per our Refund and Returns Policy.'] },
    { title: 'Incorrect Address', items: ['Customers are responsible for providing accurate shipping details.', 'Zylix 3D is not liable for orders delayed or lost due to incorrect address information provided by the customer.'] },
  ];
  return (
    <div>
      <p style={pStyle}>At {COMPANY.name}, we strive to deliver your 3D printed products and gift items safely and on time. Please review our Shipping Policy below for detailed information.</p>
      {sections.map((sec, i) => (
        <div key={i} style={sectionStyle}>
          <h2 style={h2Style}>{sec.title}</h2>
          <ul>{sec.items.map((item, j) => <li key={j} style={liStyle}>{item}</li>)}</ul>
        </div>
      ))}
      <div style={sectionStyle}>
        <h2 style={h2Style}>Contact Us</h2>
        <ContactBox />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// PAGE: FAQ
// ─────────────────────────────────────────
const faqs = [
  { q: 'What is Zylix 3D?', a: 'Zylix 3D is a 3D printing company and an online store offering customized 3D printed products and unique gift items. We specialize in personalized designs, custom models, and ready-made gifts.' },
  { q: 'Do you offer customized products?', a: 'Yes. We provide customized and personalized 3D printed products based on customer requirements, including names, designs, sizes, and special requests.' },
  { q: 'How can I place an order?', a: `You can place an order directly through our website ${COMPANY.website}. For custom orders or bulk requirements, you can also contact us via phone or email.` },
  { q: 'Are customized products returnable?', a: 'Customized and made-to-order products are non-returnable unless they arrive damaged or defective. Please refer to our Refund and Returns Policy for more details.' },
  { q: 'How long does it take to deliver an order?', a: 'Delivery time depends on the product type and customization. Estimated timelines will be shared during order confirmation. Delays may occur due to production or courier services.' },
  { q: 'What payment methods do you accept?', a: 'We accept secure online payments through supported payment gateways available on our website, including UPI, GPay, PhonePe, Paytm, and major debit/credit cards.' },
  { q: 'What should I do if I receive a damaged product?', a: 'If your product arrives damaged or defective, please contact us within 48 hours of delivery with clear photos or videos for verification.' },
  { q: 'Can I cancel my order?', a: 'Orders can be cancelled within the allowed time frame mentioned in our Refund and Returns Policy. Customized orders cannot be cancelled once production begins.' },
  { q: 'Do you accept bulk or corporate orders?', a: 'Yes. We accept bulk orders and corporate gifting requests. Please contact us directly for pricing and timelines.' },
  { q: `How can I contact ${COMPANY.name}?`, a: `Phone: ${COMPANY.phone} | Email: ${COMPANY.email} | Website: ${COMPANY.website}` },
];

function FAQPage() {
  const [openIndex, setOpenIndex] = React.useState(null);
  return (
    <div>
      <p style={{ ...pStyle, marginBottom: '1.5rem' }}>Find answers to the most common questions about Zylix 3D products, orders, and services.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {faqs.map((faq, i) => (
          <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              style={{
                width: '100%', textAlign: 'left', padding: '1rem 1.25rem',
                background: openIndex === i ? '#000' : '#fff',
                color: openIndex === i ? '#fff' : '#000',
                border: 'none', cursor: 'pointer', fontWeight: '600',
                fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', gap: '1rem', transition: 'all 0.2s'
              }}
            >
              <span>{i + 1}. {faq.q}</span>
              {openIndex === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {openIndex === i && (
              <div style={{ padding: '1rem 1.25rem', background: '#fafafa', fontSize: '0.85rem', color: '#444', lineHeight: '1.75' }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN WRAPPER — renders correct page
// ─────────────────────────────────────────
const pages = {
  about:    { title: 'About Us',              component: AboutPage },
  contact:  { title: 'Contact Us',            component: ContactPage },
  privacy:  { title: 'Privacy Policy',        component: PrivacyPage },
  terms:    { title: 'Terms & Conditions',     component: TermsPage },
  refund:   { title: 'Refund & Returns Policy', component: RefundPage },
  shipping: { title: 'Shipping Policy',        component: ShippingPage },
  faq:      { title: 'General FAQs',           component: FAQPage },
};

export default function InfoPage({ page, setActiveTab }) {
  const config = pages[page] || pages['about'];
  const PageComponent = config.component;

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.78rem', color: '#888' }}>
        <span style={{ cursor: 'pointer', color: '#000', fontWeight: '600' }} onClick={() => setActiveTab('shop')}>Home</span>
        <span>›</span>
        <span>{config.title}</span>
      </div>

      {/* Page Title */}
      <div style={{ marginBottom: '2rem', paddingBottom: '1.25rem', borderBottom: '2px solid #000' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#000', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          {config.title}
        </h1>
        <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
          Last updated: June 2025 · Zylix 3D · {COMPANY.website}
        </p>
      </div>

      {/* Page Content */}
      <PageComponent />

      {/* Quick Nav to other pages */}
      <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
        <p style={{ fontSize: '0.72rem', color: '#888', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Other pages</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {Object.entries(pages).filter(([key]) => key !== page).map(([key, val]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{
                background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#334155',
                padding: '0.35rem 0.85rem', fontSize: '0.75rem', fontWeight: '600',
                borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
            >
              {val.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
