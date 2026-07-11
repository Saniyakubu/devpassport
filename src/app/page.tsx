import DeveloperPassportApp from "./developer-passport-app";

// JSON-LD structured data for rich search results
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "GitID",
  url: "https://gitid.vercel.app",
  description:
    "Generate stunning developer passports and shareable cards from your GitHub profile. Visualize your tech stack, achievements, and coding DNA.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Saniya Kubu",
    url: "https://github.com/Saniyakubu",
  },
  screenshot: "https://gitid.vercel.app/og-image.png",
  featureList: [
    "Interactive Developer Passport Booklet",
    "Shareable GitHub Stats Cards",
    "Tech Stack Visualization",
    "Achievements & Coding Habits",
    "PDF Export & Screenshots",
    "Developer DNA Analysis",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DeveloperPassportApp />
    </>
  );
}
