import { useEffect, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, Sparkles, UserRound, X } from 'lucide-react';
import { useShop } from '../../hooks/useShop';

const quickQuestions = [
  'Is this product in stock?',
  'When will it restock?',
  'Do you support COD?',
  'How can I track my order?'
];

function getBotAnswer(question, products) {
  const lower = question.toLowerCase();
  const lowStock = products.find((product) => Number(product.stock) <= 5);
  const bestDeal = [...products].sort((a, b) => Number(b.discount) - Number(a.discount))[0];

  if (lower.includes('deal') || lower.includes('offer')) {
    return bestDeal
      ? `Today's strongest deal is ${bestDeal.title} with ${bestDeal.discount}% off. You can add it to cart and choose COD at checkout.`
      : 'Hot deals are loading. Please check the Hot Deals page in a moment.';
  }

  if (lower.includes('stock') || lower.includes('restock')) {
    if (lowStock) {
      return `${lowStock.title} is running low. If it sells out, expected restock is around 14 days. You can still place an order while stock is available.`;
    }
    return 'Most listed products are currently available. If any item becomes unavailable, our usual restock window is around 14 days.';
  }

  if (lower.includes('cod') || lower.includes('cash')) {
    return 'Yes, Cash on Delivery is available. Choose COD during checkout and pay when the product reaches your doorstep.';
  }

  if (lower.includes('track') || lower.includes('order')) {
    return 'Login to your profile dashboard to see order tracking. Status moves from Order packed to Shipped to Delivered.';
  }

  if (lower.includes('return')) {
    return 'Eligible products can be returned within 7 days if unused and in original packaging. Keep your order details ready.';
  }

  return 'I can help with product stock, restock timing, COD, delivery, returns, order tracking, and current deals. Tell me what you need.';
}

export function Chatbot() {
  const { products } = useShop();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi, I am BharatMart Help. I can help you choose products, check COD, restock time, and order tracking.' }
  ]);
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const ask = (text) => {
    if (!text.trim()) return;
    setMessages((current) => [...current, { role: 'user', text }]);
    setInput('');
    setTyping(true);

    window.setTimeout(() => {
      setMessages((current) => [...current, { role: 'bot', text: getBotAnswer(text, products) }]);
      setTyping(false);
    }, 550);
  };

  return (
    <div className="fixed bottom-6 right-5 z-50">
      {open ? (
        <div className="mb-4 w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl animate-float">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-black">BharatMart Help</p>
                  <p className="flex items-center gap-1 text-xs text-emerald-50"><span className="h-2 w-2 rounded-full bg-lime-300" /> Online shopping assistant</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div ref={listRef} className="max-h-80 space-y-3 overflow-y-auto bg-gradient-to-b from-slate-50 to-white p-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'bot' ? <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Sparkles className="h-4 w-4" /></div> : null}
                <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-5 shadow-sm ${message.role === 'bot' ? 'bg-white text-slate-700' : 'bg-emerald-500 text-white'}`}>
                  {message.text}
                </div>
                {message.role === 'user' ? <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700"><UserRound className="h-4 w-4" /></div> : null}
              </div>
            ))}
            {typing ? <p className="ml-9 text-xs font-semibold text-slate-400">Assistant is typing...</p> : null}
          </div>
          <div className="flex flex-wrap gap-2 border-t border-slate-100 p-3">
            {quickQuestions.map((question) => (
              <button key={question} type="button" onClick={() => ask(question)} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition active:scale-95 hover:bg-emerald-50 hover:text-emerald-700">
                {question}
              </button>
            ))}
          </div>
          <form onSubmit={(event) => { event.preventDefault(); ask(input); }} className="flex gap-2 border-t border-slate-100 p-3">
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Type your question..." className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500" />
            <button className="rounded-full bg-emerald-500 p-3 text-white transition active:scale-95 hover:bg-emerald-600">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : null}
      <button type="button" onClick={() => setOpen((current) => !current)} className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl transition active:scale-95 hover:scale-105 hover:bg-emerald-600">
        <MessageCircle className="h-7 w-7" />
      </button>
    </div>
  );
}

export function PurchaseToast() {
  const { products } = useShop();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!products.length) return undefined;

    const names = ['Sneha R.', 'Suresh V.', 'Priya M.', 'Aman K.', 'Neha S.'];
    const places = ['Assam, India', 'Bihar, India', 'Mumbai, India', 'Delhi, India', 'Pune, India'];
    const themes = [
      'border-blue-100 bg-blue-50/95',
      'border-emerald-100 bg-emerald-50/95',
      'border-orange-100 bg-orange-50/95',
      'border-rose-100 bg-rose-50/95',
      'border-sky-100 bg-sky-50/95'
    ];

    const showToast = () => {
      const product = products[Math.floor(Math.random() * products.length)];
      const index = Math.floor(Math.random() * names.length);
      setToast({
        name: names[index],
        place: places[index],
        product,
        minutes: Math.floor(Math.random() * 12) + 2,
        theme: themes[Math.floor(Math.random() * themes.length)]
      });
      window.setTimeout(() => setToast(null), 5000);
    };

    const first = window.setTimeout(showToast, 2500);
    const interval = window.setInterval(showToast, 18000);

    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, [products]);

  if (!toast) return null;

  return (
    <div className={`fixed bottom-6 left-4 z-40 w-[min(320px,calc(100vw-2rem))] rounded-2xl border p-4 shadow-2xl backdrop-blur animate-float ${toast.theme}`}>
      <div className="flex gap-3">
        <img src={toast.product.imageUrls?.[0]} alt="" className="h-12 w-12 rounded-xl object-cover" />
        <div>
          <p className="font-bold text-slate-900">{toast.name}</p>
          <p className="text-xs text-slate-500">{toast.place}</p>
          <p className="mt-1 text-sm text-slate-700">
            Purchased <span className="font-bold text-orange-600">{toast.product.title}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">{toast.minutes} min ago</p>
        </div>
      </div>
      <p className="mt-3 text-xs font-bold text-emerald-600">Verified Purchase</p>
    </div>
  );
}
