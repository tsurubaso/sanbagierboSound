import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Layout({ children }) {
  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-900">
      <Header />
      <div className="flex-1 p-4">{children}</div>
      <Footer />
    </div>
  );
}