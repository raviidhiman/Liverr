import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";
import { inr, errMsg } from "../utils/helpers";

const loadRazorpay = () => new Promise((resolve, reject) => {
  if (window.Razorpay) return resolve(true);
  const s = document.createElement("script");
  s.src = "https://checkout.razorpay.com/v1/checkout.js";
  s.onload = () => resolve(true);
  s.onerror = () => reject(new Error("Could not load Razorpay. Check your internet connection."));
  document.body.appendChild(s);
});

export default function PaymentPage() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [rzp, setRzp] = useState(null); // response from /payments/create-order
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    api.get(`/orders/${orderId}`).then((r) => {
      setOrder(r.data.order);
      if (r.data.order.status !== "awaiting_payment") return;
      return api.post("/payments/create-order", { orderId }).then((p) => setRzp(p.data));
    }).catch((e) => setError(errMsg(e))).finally(() => setLoading(false));
  }, [orderId]);

  const verify = async (payload) => {
    try {
      await api.post("/payments/verify", { orderId, ...payload });
      setPaid(true);
      setTimeout(() => navigate("/orders"), 1800);
    } catch (e) { setError(errMsg(e)); setBusy(false); }
  };

  const payMock = () => { setBusy(true); setError(""); verify({ razorpayOrderId: rzp.razorpayOrderId, razorpayPaymentId: `mock_pay_${Date.now()}`, razorpaySignature: "mock" }); };

  const payRazorpay = async () => {
    setBusy(true); setError("");
    try {
      await loadRazorpay();
      const checkout = new window.Razorpay({
        key: rzp.keyId, amount: rzp.amount, currency: rzp.currency, name: "Liverr",
        description: order.gigTitle, order_id: rzp.razorpayOrderId,
        prefill: { name: user.name, email: user.email },
        theme: { color: "#1dbf73" },
        handler: (resp) => verify({ razorpayOrderId: resp.razorpay_order_id, razorpayPaymentId: resp.razorpay_payment_id, razorpaySignature: resp.razorpay_signature }),
        modal: { ondismiss: () => setBusy(false) },
      });
      checkout.on("payment.failed", (r) => { setError(r.error?.description || "Payment failed"); setBusy(false); });
      checkout.open();
    } catch (e) { setError(e.message); setBusy(false); }
  };

  if (loading) return <Spinner full />;
  if (!order) return <div className="container py-16 text-center"><div className="alert-error inline-block">{error || "Order not found"}</div></div>;

  return (
    <div className="container py-10 flex justify-center">
      <div className="card w-full max-w-lg p-8">
        {paid ? (
          <div className="text-center py-6"><div className="text-6xl">✅</div><h1 className="text-2xl font-bold mt-3">Payment successful!</h1><p className="text-gray-500 mt-1">Your order is now active. Redirecting...</p></div>
        ) : order.status !== "awaiting_payment" ? (
          <div className="text-center"><h1 className="text-xl font-bold">This order is already {order.status.replace("_", " ")}</h1><Link to="/orders" className="btn-primary mt-4 inline-flex">Go to orders</Link></div>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Checkout</h1>
            <div className="mt-5 border border-gray-200 rounded-lg p-4 text-sm space-y-2">
              <div className="font-semibold">{order.gigTitle}</div>
              <div className="flex justify-between text-gray-600"><span>Package</span><span className="capitalize">{order.package}</span></div>
              <div className="flex justify-between text-gray-600"><span>Delivery</span><span>{order.deliveryTime} day(s)</span></div>
              <div className="flex justify-between text-gray-600"><span>Seller</span><span>{order.seller?.name}</span></div>
              <div className="flex justify-between font-bold text-lg border-t pt-3"><span>Total</span><span>{inr(order.price)}</span></div>
            </div>
            {error && <div className="alert-error mt-4">{error}</div>}
            {rzp?.mock ? (
              <>
                <div className="alert-info mt-4">🧪 <b>Test mode:</b> Razorpay keys are not configured, so no real money moves. Click below to simulate a successful payment.</div>
                <button className="btn-primary w-full mt-4" disabled={busy} onClick={payMock}>{busy ? "Processing..." : `Simulate payment of ${inr(order.price)}`}</button>
              </>
            ) : (
              <button className="btn-primary w-full mt-5" disabled={busy || !rzp} onClick={payRazorpay}>{busy ? "Processing..." : `Pay ${inr(order.price)} with Razorpay`}</button>
            )}
            <p className="text-xs text-gray-400 text-center mt-3">🔒 Payments are verified securely on our server.</p>
            <Link to="/orders" className="block text-center text-sm text-gray-500 mt-3">Pay later</Link>
          </>
        )}
      </div>
    </div>
  );
}
