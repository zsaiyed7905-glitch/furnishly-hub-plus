import React from "react";

const Footer = () => (
  <footer className="bg-foreground text-primary-foreground mt-16">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-display text-xl font-bold mb-3">FurniShop</h3>
          <p className="text-sm opacity-70 leading-relaxed">
            Curated modern furniture for thoughtful living. Quality craftsmanship, timeless design.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider mb-3">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm opacity-70">
            <span>About Us</span>
            <span>Contact</span>
            <span>Shipping & Returns</span>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider mb-3">Contact</h4>
          <div className="flex flex-col gap-2 text-sm opacity-70">
            <span>hello@furnishop.com</span>
            <span>+91 98765 43210</span>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-xs opacity-50">
        © 2026 FurniShop. College Project Demo.
      </div>
    </div>
  </footer>
);

export default Footer;
