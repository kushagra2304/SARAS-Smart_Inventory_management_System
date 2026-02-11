import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from '@zxing/browser';
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";

const BASE_URL = import.meta.env.VITE_API_URL;

const ScanProduct = () => {
  const videoRef = useRef(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [bill, setBill] = useState(null);
  const [mobileNumber, setMobileNumber] = useState("");
  const scannedCodeRef = useRef(null);
const lastScanTimeRef = useRef(0);
const scanningLockRef = useRef(false);


const scannerInputRef = useRef(null);
const bufferRef = useRef("");

const handleScannerInput = (e) => {
  if (e.key === "Enter") {
    const scannedCode = bufferRef.current.trim();
    bufferRef.current = "";

    if (scannedCode) {
      console.log("🖨️ Scanner code received:", scannedCode);
      fetchProduct(scannedCode);
    }
  } else if (e.key.length === 1) {
    bufferRef.current += e.key;
  }
};


//  const hints = new Map();
// hints.set(DecodeHintType.POSSIBLE_FORMATS, [
//   BarcodeFormat.CODE_128,
//   BarcodeFormat.EAN_13,
//   BarcodeFormat.QR_CODE,
//   BarcodeFormat.UPC_A,
// ]);

  useEffect(() => {
  const codeReader = new BrowserMultiFormatReader();
  let stopScanner = null;

  const startScanner = async () => {
    if (!videoRef.current) {
      console.warn("videoRef is not ready");
      return;
    }

    

try {
  const resultStream = await codeReader.decodeFromVideoDevice(
    null,
    videoRef.current,
    async (result, error) => {
      console.log("🔍 Callback triggered"); 

      if (result) {
        const code = result.getText();
        console.log("✅ Barcode Detected:", code);

       const cleanedCode = code.replace(/[^a-zA-Z0-9]/g, '').trim();

  console.log("🧼 Cleaned Barcode:", cleanedCode);

  if (cleanedCode && !scanningLockRef.current) {
    scanningLockRef.current = true;

    await fetchProduct(cleanedCode);

          setTimeout(() => {
            scanningLockRef.current = false;
            console.log("🔓 Lock released");
          }, 1000);
        } else {
          console.log("🚫 Either code empty or scanning locked");
        }
      } else if (error) {
        console.log("❌ No code detected:", error.message);
      }
    }
  );

  stopScanner = () => resultStream.stop();
  console.log("📷 Scanner started");
} catch (err) {
  console.error("💥 Error initializing ZXing:", err);
  setError("Failed to access camera for scanning.");
}
  };

  // Delay to ensure video element is mounted
  const timeoutId = setTimeout(startScanner, 500);

  return () => {
    clearTimeout(timeoutId);
    if (stopScanner) stopScanner();
  };
}, []);


  const fetchProduct = async (code) => {
    console.log(`📦 Scanning product with code: ${code}`);
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${BASE_URL}/api/products/barcode/${code}`);
      const product = res.data;
      console.log("✅ Product fetched:", product);

      if (
        !product ||
        !product.description ||
        product.quantity === undefined ||
        product.price === undefined
      ) {
        throw new Error("Invalid product data.");
      }

     setCart((prevCart) => {
  const existingIndex = prevCart.findIndex(
    (item) => item.comp_code === product.comp_code
  );

  if (existingIndex !== -1) {
    const updatedCart = [...prevCart];
    const itemToUpdate = { ...updatedCart[existingIndex] };
    const currentQty = Number(itemToUpdate.qty) || 0;
    const maxQty = Number(product.quantity);
    const price = Number(product.price);
    const newQty = Math.min(currentQty + 1, maxQty);
    itemToUpdate.qty = newQty;
    itemToUpdate.totalPrice = price * newQty;

    updatedCart[existingIndex] = itemToUpdate;

    return updatedCart;
  }
  return [
    ...prevCart,
    {
      ...product,
      price: Number(product.price),
      qty: 1,
      totalPrice: Number(product.price),
    },
  ];
});
      setSuccessMessage("");
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Product not found or invalid. Details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      fetchProduct(manualCode.trim());
      setManualCode("");
    }
  };

  const handleBuyNow = async () => {
    if (cart.length === 0) {
      setError("Your cart is empty!");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const payload = {
        items: cart.map((item) => ({
          item_code: item.comp_code,
          quantity: item.qty,
          price: item.price,
          transaction_type: "issued",
        })),
      };

      const res = await axios.post(`${BASE_URL}/inventory/transaction-scan`, payload);

      if (res.status === 200) {
        setSuccessMessage("Purchase and billing completed successfully!");
        setBill({
          bill_id: res.data.bill_id,
          total_amount: res.data.total_amount,
          items: cart,
        });
        setCart([]);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error("Purchase error:", err);
      setError("An error occurred while completing the purchase.");
    } finally {
      setLoading(false);
    }
  };

  const generatePdf = () => {
    if (!bill) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Purchase Bill", 14, 22);
    doc.setFontSize(12);
    doc.text(`Bill ID: ${bill.bill_id}`, 14, 32);
    doc.text(`Total Amount: Rs.${bill.total_amount.toFixed(2)}`, 14, 40);

    let y = 50;
    doc.text("Product", 14, y);
    doc.text("Qty", 100, y);
    doc.text("Price (Rs.)", 120, y);
    doc.text("Total (Rs.)", 160, y);

    y += 8;
    bill.items.forEach((item) => {
      doc.text(item.description, 14, y);
      doc.text(String(item.qty), 100, y);
      doc.text(item.price.toFixed(2), 120, y);
      doc.text(item.totalPrice.toFixed(2), 160, y);
      y += 8;
    });

    doc.save(`bill_${bill.bill_id}.pdf`);
  };

  const printBill = () => {
    const printContents = document.getElementById("bill-section").innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };
  const sendViaWhatsApp = async () => {
  if (!bill || !mobileNumber) {
    return alert("Enter mobile number first.");
  }

  const message = `🧾 *Purchase Bill*
Bill ID: ${bill.bill_id}
Total Amount: Rs.${bill.total_amount.toFixed(2)}

Items:
${bill.items
  .map((item) => `• ${item.description} (x${item.qty}) - Rs.${item.totalPrice.toFixed(2)}`)
  .join("\n")}

Thank you for shopping!`;

  const encodedMsg = encodeURIComponent(message);
  const waLink = `https://wa.me/${mobileNumber}?text=${encodedMsg}`;
  window.open(waLink, "_blank");

  try {
    await axios.post(`${BASE_URL}/api/bills`, {
      bill_id: bill.bill_id,
      mobile: mobileNumber,
      timestamp: new Date().toISOString(),
    });
    alert("WhatsApp message sent and log saved.");
  } catch (err) {
    console.error("Logging failed:", err);
    alert("WhatsApp sent, but logging failed.");
  }
};


  return (
    <div className="p-6 space-y-6 relative">
       <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
        🧾 Scan Product (USB Scanner)
      </h2>

      <p className="text-center text-gray-600 font-medium">
        Connect a barcode scanner and scan a product.
      </p>

      <form
        onSubmit={handleManualSubmit}
        className="flex gap-2 items-center justify-center"
      >
        <input
          type="text"
          placeholder="Enter barcode manually"
          className="border p-2 rounded-lg w-64"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
        />
        <input
  type="text"
  autoFocus
  onKeyDown={handleScannerInput}
  className="absolute top-0 left-0 opacity-0 z-[-1]"
  ref={scannerInputRef}
/>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          Add
        </button>
      </form>

      {loading && (
        <div className="flex justify-center items-center text-indigo-600 gap-2">
          <Loader2 className="animate-spin" /> Fetching product details...
        </div>
      )}

      {error && (
        <div className="text-red-500 flex items-center gap-2 text-center justify-center">
          <AlertCircle /> {error}
        </div>
      )}

      <div className="space-y-4">
        {cart.length > 0 ? (
          <Card className="max-w-2xl mx-auto border-indigo-300 bg-indigo-50">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-xl font-semibold text-indigo-800">Your Cart</h3>
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-indigo-600 border-b border-indigo-200">
                    <th className="p-2">Product</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Price (Rs.)</th>
                    <th className="p-2">Total Price (Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2">{item.description}</td>
                      <td className="p-2">{item.qty}</td>
                      <td className="p-2">{Number(item.price).toFixed(2)}</td>
<td className="p-2">{Number(item.totalPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="text-right text-indigo-800 font-semibold text-lg">
                Total: Rs.{cart.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
              </p>

              <button
                className="w-full bg-indigo-600 text-white py-2 rounded-lg mt-4"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="text-gray-500 text-center">Your cart is empty</div>
        )}
      </div>
       {bill && (
        <Card className="max-w-2xl mx-auto border-indigo-300 bg-indigo-50" id="bill-section">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-xl font-semibold text-indigo-800">Purchase Bill</h3>
            <p>Bill ID: {bill.bill_id}</p>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-indigo-600 border-b border-indigo-200">
                  <th className="p-2">Product</th>
                  <th className="p-2">Qty</th>
                  <th className="p-2">Price (Rs.)</th>
                  <th className="p-2">Total Price (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item, index) => (
                  <tr key={index}>
                    <td className="p-2">{item.description}</td>
                    <td className="p-2">{item.qty}</td>
                    <td className="p-2">{item.price.toFixed(2)}</td>
                    <td className="p-2">{item.totalPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-right text-indigo-800 font-semibold text-lg mt-2">
              Total: Rs.{bill.total_amount.toFixed(2)}
            </p>

            <div className="flex gap-4 mt-4">
              <button
                className="bg-indigo-600 text-white py-2 px-4 rounded-lg"
                onClick={printBill}
              >
                Print Bill
              </button>
              <button
                className="bg-green-600 text-white py-2 px-4 rounded-lg"
                onClick={generatePdf}
              >
                Download PDF
              </button>
            </div>
  <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
    <input
      type="tel"
      placeholder="Enter mobile number"
      value={mobileNumber}
      onChange={(e) => setMobileNumber(e.target.value)}
      className="border p-2 rounded-md w-full sm:w-64"
    />
    <button
      onClick={sendViaWhatsApp}
      className="bg-emerald-600 text-white py-2 px-4 rounded-lg"
    >
      Send via WhatsApp
    </button>
  </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default ScanProduct;