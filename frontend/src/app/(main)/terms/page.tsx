"use client";

import React, { useState } from "react";
import Link from "next/link";

const SECTIONS = [
  {
    id: "definitions",
    title: "Definitions & Interpretation",
    content: [
      'In the following Terms and Conditions of sale, unless the context requires otherwise:',
      '(a) "Shop" means Shop Pty Ltd;',
      '(b) "Customer" means the person or corporation placing an order for the purchase of goods or services from Shop;',
      '(c) "Products" means any laptop, hardware, materials, equipment or services provided to the Customer by Shop;',
      '(d) if the Customer comprises more than one person, each of those person’s liability is joint and several;',
      '(e) references to a party or a person includes any form of entity and their respective successors, assigns and representatives.',
    ],
  },
  {
    id: "general",
    title: "General",
    content: [
      "By ordering the Products and/or accepting delivery of the Products from Shop, the Customer agrees that it is bound by these Terms and Conditions of sale. Customer orders, including orders placed via the internet, are subject to acceptance by Shop.",
      "The acceptance of the Customer's order by Shop is expressly made conditional upon the Customer's assent to these Terms and Conditions which will prevail notwithstanding anything that may be stated to the contrary on the Customer's order.",
    ],
  },
  {
    id: "quotations",
    title: "Quotations",
    content: [
      "Any quotation by Shop to the Customer will be open for acceptance by the Customer within the period stated in the quotation or, where no period is stated, within seven (7) days from the date of the quotation. Thereafter, prices stated in the quotation may be varied by Shop without notice to the Customer.",
    ],
  },
  {
    id: "prices-taxes",
    title: "Prices / Taxes",
    content: [
      "The prices charged by and payable to Shop will be the ruling prices applicable at the time of order placement, provided that the Products are accepted for delivery within a reasonable time. Prices are subject to change without notice.",
      "Prices include VAT/GST unless otherwise stated, and any additional shipping or handling duty is displayed at checkout prior to payment.",
    ],
  },
  {
    id: "terms-of-payment",
    title: "Terms of Payment",
    content: [
      "Customers may pay via Cash on Delivery (COD) or online electronic payment methods offered at checkout. Where commercial credit has not been agreed in writing, payment is due upon delivery or order confirmation.",
    ],
  },
  {
    id: "credit-accounts",
    title: "Credit Accounts",
    content: [
      "Any commercial credit arrangements that are provided to the Customer by Shop will continue until terminated by Shop at its sole discretion. In the event that Shop terminates the Customer's commercial credit arrangement, the Customer will be notified in writing.",
    ],
  },
  {
    id: "change-of-ownership",
    title: "Change of Ownership",
    content: [
      "Trading accounts are approved by Shop based on the information supplied and the representations made by the Customer. In the event that there is a change in ownership of the Customer, the Customer must immediately provide written notice to Shop.",
    ],
  },
  {
    id: "product-information",
    title: "Information on the Products supplied",
    content: [
      "All descriptive specifications, illustrations, drawings, data, dimensions and weights furnished by Shop or otherwise contained in catalogues or other advertising material are approximate only and are intended to be a general description of the goods.",
    ],
  },
  {
    id: "delivery",
    title: "Delivery",
    content: [
      "The means of delivering the Products to the Customer will be at Shop's discretion. The Customer agrees to accept delivery of the Products sold at any time during normal business hours.",
    ],
  },
];

export default function TermsPage() {
  const [activeId, setActiveId] = useState("definitions");

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-[1400px]">
        {/* Breadcrumb - Figma FAQ - 1 (Node 133:4451) */}
        <nav className="text-[12px] text-black mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#0156FF]">
            Home
          </Link>
          <span className="text-[#0156FF]">›</span>
          <span className="text-[#A2A6B0]">Shop Terms &amp; Conditions</span>
        </nav>

        {/* Page Title */}
        <h1 className="text-[32px] font-semibold text-black mb-7">
          Shop Terms &amp; Conditions
        </h1>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Content (1039px in Figma) */}
          <div className="flex-1 space-y-8">
            <h2 className="text-[24px] font-semibold text-black uppercase leading-[1.4]">
              GENERAL TERMS AND CONDITIONS FOR SALE OF PRODUCTS AND SERVICES
            </h2>

            {SECTIONS.map((sec) => (
              <section key={sec.id} id={sec.id} className="scroll-mt-24">
                <h3 className="text-[16px] font-bold text-black mb-3">
                  {sec.title}
                </h3>
                <div className="space-y-3 text-[16px] font-light text-black leading-[26px]">
                  {sec.content.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Right Sidebar (#F5F7FF, 327px - Figma Frame 159) */}
          <aside className="w-full lg:w-[327px] flex-shrink-0 bg-[#F5F7FF] p-6 lg:sticky lg:top-6">
            <ul className="space-y-3.5 text-[14px]">
              {SECTIONS.map((sec) => (
                <li key={sec.id}>
                  <a
                    href={`#${sec.id}`}
                    onClick={() => setActiveId(sec.id)}
                    className={`block transition-colors ${
                      activeId === sec.id
                        ? "font-semibold text-black"
                        : "font-normal text-[#666666] hover:text-black"
                    }`}
                  >
                    {sec.title}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
