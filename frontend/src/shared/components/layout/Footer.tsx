import React from "react";
import { Facebook, Instagram } from "lucide-react";
import { Button } from "../ui/button";

// Dữ liệu tĩnh, tương tự file data.ts của bạn
const footerData = {
  widgetsHeader: [
    {
      title: "Product Support",
      context:
        "Up to 3 years on-site warranty available for your peace of mind.",
      urlImg: "/assets/icon/support.svg",
    },
    {
      title: "Personal Account",
      context:
        "With big discounts, free delivery and a dedicated support specialist.",
      urlImg: "/assets/icon/account.svg",
    },
    {
      title: "Amazing Savings",
      context: "Up to 70% off new Products, you can be sure of the best price.",
      urlImg: "/assets/icon/saving.svg",
    },
  ],
  headerCenter: [
    {
      title: "Information",
      parts: [
        "About Us",
        "About Zip",
        "Privacy Policy",
        "Search",
        "Terms",
        "Orders and Returns",
        "Contact Us",
        "Advanced Search",
        "Newsletter Subscription",
      ],
    },
    {
      title: "PC Parts",
      parts: [
        "CPUS",
        "Add On Cards",
        "Hard Drives (Internal)",
        "Graphic Cards",
        "Keyboards / Mice",
        "Cases / Power Supplies / Cooling",
        "RAM (Memory)",
        "Software",
        "Speakers / Headsets",
        "Motherboards",
      ],
    },
    {
      title: "Desktop PCs",
      parts: [
        "Custom PCs",
        "Servers",
        "MSI All-In-One PCs",
        "ASUS PCs",
        "Tecs PCs",
      ],
    },
    {
      title: "Laptops",
      parts: [
        "Evryday Use Notebooks",
        "MSI Workstation Series",
        "MSI Prestige Series",
        "Tablets and Pads",
        "Netbooks",
        "Infinity Gaming Notebooks",
      ],
    },
  ],
  address: {
    title: "Address",
    lines: [
      "19 Nguyễn Du, P7, Gò Vấp, TPHCM",
      "Phones: 0987556203",
      "Open: Monday-Thursday: 9:00 AM - 5:30 PM",
      "Friday: 9:00 AM - 6:00 PM",
      "Saturday: 11:00 AM - 5:00 PM",
      "Email: NguyenDangNguyen1606@gmail.com",
    ],
  },
  payment: [
    "/assets/icon/payment01.svg",
    "/assets/icon/payment02.svg",
    "/assets/icon/payment03.svg",
    "/assets/icon/payment04.svg",
    "/assets/icon/payment05.svg",
  ],
};

const Footer = () => {
  return (
    <footer className="mt-5">
      {/* Widget Section */}
      <div className="container mx-auto mb-12">
        <div className="flex items-center justify-center gap-16">
          {footerData.widgetsHeader.map((widget, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center w-64"
            >
              <img
                src={widget.urlImg}
                alt={widget.title}
                className="h-12 w-12 mb-6"
              />
              <h3 className="text-lg font-bold mb-3.5">{widget.title}</h3>
              <p className="text-sm text-gray-600">{widget.context}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer (Black background) */}
      <div className="bg-black text-white">
        <div className="container mx-auto pt-12 pb-8">
          {/* Newsletter Section */}
          <div className="flex items-center justify-between mb-11">
            <div>
              <h2 className="text-4xl font-medium mb-2">
                Sign Up To Our Newsletter
              </h2>
              <span className="text-base font-light">
                Be the first to hear about the latest offers
              </span>
            </div>
            <div className="flex items-center">
              <input
                type="email"
                placeholder="Your Email"
                className="bg-black border-2 border-white rounded-md w-96 h-12 px-3 text-white placeholder-white font-light text-sm focus:outline-none"
              />
              <Button className="bg-blue-600 hover:bg-blue-700 rounded-full ml-6 px-5 py-3 text-sm font-semibold h-12">
                Subscribe
              </Button>
            </div>
          </div>

          {/* Links Section */}
          <div className="flex justify-between text-sm">
            {footerData.headerCenter.map((column, index) => (
              <div key={index}>
                <h4 className="font-bold text-gray-400 mb-5">{column.title}</h4>
                <ul className="space-y-1.5">
                  {column.parts.map((part, i) => (
                    <li key={i}>
                      <a href="#" className="hover:underline">
                        {part}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h4 className="font-bold text-gray-400 mb-5">
                {footerData.address.title}
              </h4>
              <ul className="space-y-1.5">
                {footerData.address.lines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700">
          <div className="container mx-auto flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <a href="#">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              {footerData.payment.map((p, i) => (
                <img key={i} src={p} alt="Payment method" className="h-5" />
              ))}
            </div>
            <p className="text-xs text-gray-400">
              Copyright © 2020 Shop Pty. Ltd.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
