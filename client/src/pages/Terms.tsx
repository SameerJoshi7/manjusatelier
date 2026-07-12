import { usePageMeta } from '@/hooks/usePageMeta';

export default function Terms() {
  usePageMeta({
    title: 'Terms & Conditions',
    description: 'Terms, conditions, and policies for Manju\'s Atelier.',
  });

  return (
    <div className="container-x py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 font-serif text-4xl text-brown-dark md:text-5xl dark:text-beige">
          Terms & Conditions
        </h1>

        <div className="prose prose-brown dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-brown-dark dark:text-beige">
              1. Acceptance of Terms
            </h2>
            <p className="text-brown/80 dark:text-beige/80">
              By accessing and using the website of Manju's Atelier, you accept and agree to be bound by the terms and provision of this agreement. Any participation in this service will constitute acceptance of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-brown-dark dark:text-beige">
              2. Product Descriptions & Handmade Variations
            </h2>
            <p className="text-brown/80 dark:text-beige/80">
              All items at Manju's Atelier are meticulously handcrafted. Due to the nature of handmade goods, slight variations in color, texture, and size are to be expected and celebrated as part of the unique charm of the craft. These natural variations are not considered defects.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-brown-dark dark:text-beige">
              3. Payments & Manual UPI
            </h2>
            <p className="text-brown/80 dark:text-beige/80">
              We accept payments via UPI. Upon placing an order, you will be provided with a QR code and UPI ID. Your order will be placed in a "Pending UTR" state until you successfully transfer the funds and provide the 12-digit UTR (Transaction ID). 
              <br /><br />
              Orders will only be processed and confirmed once the payment is verified against the provided UTR by our admin team. If payment is not completed within 48 hours, the order will be automatically cancelled.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-brown-dark dark:text-beige">
              4. Shipping & Delivery
            </h2>
            <p className="text-brown/80 dark:text-beige/80">
              Since our products are crafted with care, processing times may vary between 3-7 business days before shipping. Once shipped, a tracking link and AWB number will be provided. We are not responsible for delays caused by the courier service, but we will assist in tracking lost packages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-brown-dark dark:text-beige">
              5. Returns, Refunds & Cancellations
            </h2>
            <p className="text-brown/80 dark:text-beige/80">
              <strong>Cancellations:</strong> You may cancel your order within 24 hours of placing it (provided it has not already been shipped) for a full refund.
              <br /><br />
              <strong>Returns:</strong> Due to the fragile and custom nature of our crafts, we do not accept returns unless the item arrives severely damaged. If your item arrives damaged, please contact us within 48 hours of delivery with clear photographs of the package and the product.
              <br /><br />
              <strong>Refunds:</strong> Approved refunds will be processed back to the original UPI account within 5-7 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-brown-dark dark:text-beige">
              6. Intellectual Property
            </h2>
            <p className="text-brown/80 dark:text-beige/80">
              All content on this website, including but not limited to designs, text, graphics, logos, and images, is the property of Manju's Atelier. Unauthorized use or reproduction of our designs is strictly prohibited.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
