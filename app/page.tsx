"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, Coffee, Film, Utensils, Clock } from "lucide-react";
import confetti from "canvas-confetti";
import ThemedCard from "@/components/ThemedCard";
import Sparkles from "@/components/Sparkles";
import FloatingOrbs from "@/components/FloatingOrbs";
import FairyFooter from "@/components/FairyFooter";
import StepCard from "@/components/StepCard";
import SelectButton from "@/components/SelectButton";

interface Answers {
  isAvailable: boolean | null;
  date: Date | null;
  time: string;
  food: string[];
  movie: string;
  excitement: number;
}


const HeartBackground = dynamic(() => import("@/components/HeartBackground"), {
  ssr: false,
});

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5 },
};

function EvasiveNoButton() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  // Minimum allowed distance (px) between cursor and button center
  const MIN_DIST = 140;
  // padding inside container
  const PADDING = 8;

  useEffect(() => {
    const container = containerRef.current || document.body;

    const onMove = (e: MouseEvent) => {
      const btn = btnRef.current;
      const containerRect = containerRef.current?.getBoundingClientRect() || {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };

      const btnRect = btn?.getBoundingClientRect();
      const btnCenterX = btnRect ? btnRect.left + btnRect.width / 2 : containerRect.left + 40;
      const btnCenterY = btnRect ? btnRect.top + btnRect.height / 2 : containerRect.top + 16;

      const dx = e.clientX - btnCenterX;
      const dy = e.clientY - btnCenterY;
      const dist = Math.hypot(dx, dy);

      if (dist < MIN_DIST) {
        // move button to the opposite side of the cursor, at MIN_DIST distance
        const angle = Math.atan2(dy, dx);
        const targetX = e.clientX + Math.cos(angle) * MIN_DIST;
        const targetY = e.clientY + Math.sin(angle) * MIN_DIST;

        // calculate left/top relative to container
        const newLeft = targetX - containerRect.left - (btnRect ? btnRect.width / 2 : 0);
        const newTop = targetY - containerRect.top - (btnRect ? btnRect.height / 2 : 0);

        const maxLeft = Math.max(0, containerRect.width - (btnRect ? btnRect.width : 80) - PADDING);
        const maxTop = Math.max(0, containerRect.height - (btnRect ? btnRect.height : 36) - PADDING);

        // clamp to container bounds
        const clampedLeft = Math.max(PADDING, Math.min(newLeft, maxLeft));
        const clampedTop = Math.max(PADDING, Math.min(newTop, maxTop));

        setPos({ left: clampedLeft, top: clampedTop });
      }
    };

    container.addEventListener("mousemove", onMove);
    return () => container.removeEventListener("mousemove", onMove);
  }, []);

  // reset position when cursor leaves container
  const handleLeave = () => setPos({ left: 0, top: 0 });

  return (
    <div ref={containerRef} className="relative inline-block w-44 h-12" onMouseLeave={handleLeave}>
      <button
        ref={btnRef}
        onClick={(e) => e.preventDefault()}
        className="border-pink-300 text-pink-500 bg-white font-bold py-2 px-4 rounded-full shadow-sm"
        style={{ position: "absolute", left: pos.left, top: pos.top, transition: "left 260ms cubic-bezier(.2,.8,.2,1), top 260ms cubic-bezier(.2,.8,.2,1)" }}
      >
        No
      </button>
    </div>
  );
}

export default function EnchantingDateProposalApp() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    isAvailable: null,
    date: null,
    time: "",
    food: [],
    movie: "",
    excitement: 50,
  });

  const [hour, setHour] = useState<string>("7");
  const [minute, setMinute] = useState<string>("00");
  const [ampm, setAmpm] = useState<string>("PM");

  useEffect(() => {
    setAnswers((prev) => ({ ...prev, time: `${hour}:${minute} ${ampm}` }));
  }, [hour, minute, ampm]);

  const handleAnswer = (key: keyof Answers, value: Answers[keyof Answers]) => {
    setAnswers({ ...answers, [key]: value });
    setStep(step + 1);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const formatDate = (d: Date | null) => {
    if (!d) return "";
    try {
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return d.toDateString();
    }
  };

  const steps = [
    
    <motion.div key="step0" className="text-center" {...fadeInUp}>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-500">
          Madam ji, will you go on a date with me?
        </h1>
      <motion.img
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        src="https://media1.tenor.com/m/59regbBE_kwAAAAd/tkthao219-bubududu.gif"
        alt="Cute bear proposal gif"
        className="w-full max-w-md mx-auto mb-4 rounded-lg shadow-lg"
      />
      <div className="space-x-4">
        <Button
          onClick={() => {
            handleAnswer("isAvailable", true);
            triggerConfetti();
          }}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
        >
          Yes, I&apos;d love to!
        </Button>
        {/* Playful evasive "No" button: it moves away on hover/mouse enter */}
        <div className="inline-block align-middle">
          <EvasiveNoButton />
        </div>
      </div>
    </motion.div>,

    
    <motion.div key="step1" className="text-center" {...fadeInUp}>
      <StepCard stepNumber={1} totalSteps={4}>
      <h2 className="text-4xl sm:text-5xl font-playfair font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-600">
        YEYYYYYYYY, WHEN SHALL WE GO?
      </h2>
      <motion.img
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        src="https://media.tenor.com/WiQQRwR2QFAAAAAi/cute-panda.gif"
        alt="Excited bear gif"
        className="w-full max-w-md mx-auto mb-6 rounded-2xl shadow-2xl shadow-pink-300/30"
      />
      <div className="mb-6 p-4 bg-white rounded-lg shadow-lg">
        <Calendar
          mode="single"
          selected={answers.date || undefined}
          onSelect={(date) => setAnswers({ ...answers, date: date || null })}
          className="mx-auto mb-4 w-full max-w-md"
          month={new Date(new Date().getFullYear(), 6)}
          disabled={(day) => day.getMonth() !== 6}
        />
        <div className="flex gap-3 justify-center mt-4">
          <Select onValueChange={(val) => setHour(val)}>
            <SelectTrigger className="w-24 bg-pink-50 border-pink-200 text-pink-700">
              <SelectValue placeholder="Hour" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                <SelectItem key={h} value={`${h}`}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(val) => setMinute(val)}>
            <SelectTrigger className="w-20 bg-pink-50 border-pink-200 text-pink-700">
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent>
              {['00', '15', '30', '45'].map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(val) => setAmpm(val)}>
            <SelectTrigger className="w-20 bg-pink-50 border-pink-200 text-pink-700">
              <SelectValue placeholder="AM/PM" />
            </SelectTrigger>
            <SelectContent>
              {['AM', 'PM'].map((ap) => (
                <SelectItem key={ap} value={ap}>
                  {ap}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        onClick={() => setStep(step + 1)}
        disabled={!answers.date || !answers.time}
        className="bg-gradient-to-r from-pink-500 to-rose-500 hover:brightness-95 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        <Clock className="mr-2 h-5 w-5" /> Set our date!{" "}
        <Heart className="ml-2 h-5 w-5" />
      </Button>
      </StepCard>
    </motion.div>,

  
    <motion.div key="step2" className="text-center" {...fadeInUp}>
      <StepCard stepNumber={2} totalSteps={4}>
      <h2 className="text-4xl sm:text-5xl font-playfair font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-600">
        What shall we feast on, my dear?
      </h2>
      <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8">
        {[
          { name: "Snack Platter", icon: <Coffee className="w-6 h-6" /> },
          { name: "Rajma Chawal", icon: <Utensils className="w-6 h-6" /> },
          { name: "Paneer Butter Masala", icon: <Utensils className="w-6 h-6" /> },
          { name: "Veg Biryani", icon: <Utensils className="w-6 h-6" /> },
          { name: "Masala Dosa", icon: <Utensils className="w-6 h-6" /> },
        ].map(({ name, icon }) => (
          <SelectButton
            key={name}
            icon={icon}
            label={name}
            isSelected={answers.food.includes(name)}
            onClick={() => {
              const newFood = answers.food.includes(name)
                ? answers.food.filter((f) => f !== name)
                : [...answers.food, name];
              setAnswers({ ...answers, food: newFood });
            }}
          />
        ))}
      </div>
      <Button
        onClick={() => setStep(step + 1)}
        disabled={answers.food.length === 0}
        className="bg-gradient-to-r from-pink-500 to-rose-500 hover:brightness-95 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        Looks delicious! 🍽️
      </Button>
      </StepCard>
    </motion.div>,

     
    <motion.div key="step3" className="text-center" {...fadeInUp}>
      <StepCard stepNumber={3} totalSteps={4}>
      <h2 className="text-3xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-600">
        What shall we watch together?
      </h2>
      <div className="grid grid-cols-1 gap-6 mb-6">
        <motion.button
          key="other"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white text-pink-600 hover:bg-pink-100 font-bold py-4 px-6 rounded-lg shadow-md transition-colors duration-300 max-w-md mx-auto"
          onClick={() => {
            const customMovie = prompt("What movie would you like to watch?");
            if (customMovie) handleAnswer("movie", customMovie);
          }}
        >
          <Film className="mx-auto mb-2" />
          Something else (suggest any)
        </motion.button>
      </div>
      </StepCard>
    </motion.div>,

    
    

     
    <motion.div key="step4" className="text-center" {...fadeInUp}>
      <StepCard stepNumber={4} totalSteps={4}>
      <h2 className="text-5xl sm:text-6xl font-playfair font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-500">
        It&apos;s a date, my love!
      </h2>
      <p className="text-lg text-rose-500 mb-3 font-poppins">
        I can&apos;t wait to see you on:
      </p>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="inline-block bg-gradient-to-r from-pink-100 to-rose-100 px-6 py-4 rounded-2xl border border-pink-200 mb-8"
      >
        <p className="text-3xl font-playfair font-bold text-pink-700">
          {formatDate(answers.date)} at {answers.time}
        </p>
      </motion.div>
      <motion.img
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        src="https://media.tenor.com/yvUCU981VYoAAAAj/mochi-cat-goma.gif"
        alt="Excited bear gif"
        className="w-full max-w-md mx-auto mb-6 rounded-2xl shadow-2xl shadow-pink-300/30"
      />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Heart className="text-red-500 w-16 h-16 mx-auto mt-6 animate-pulse" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="mt-8 space-y-3 text-lg text-pink-600 font-poppins"
      >
        <p className="text-base">We&apos;ll enjoy some delicious <span className="font-semibold">{answers.food.join(", ")}</span>.</p>
        <p className="text-base">Then we&apos;ll watch <span className="font-semibold italic">&quot;{answers.movie}&quot;</span> together.</p>
        <div className="text-xl font-playfair font-bold mt-6 space-y-3">
          <p>P.S. I promise to bring extra samosas .. and maybe a cheesy pickup line or two. 🤭</p>
          <p className="text-base font-normal italic">
          <br/>.</p>
        </div>
      </motion.div>
      </StepCard>
    </motion.div>,
  ];

  useEffect(() => {
    const saveAnswers = async () => {
      console.log('Saved answers:', answers);
      
      // Save to localStorage
      localStorage.setItem('dateProposalAnswers', JSON.stringify(answers));

      // Send to your email
      try {
        await fetch('/api/send-response', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(answers),
        });
      } catch (error) {
        console.error('Failed to send response:', error);
      }
    };

    if (step === steps.length - 1) {
      saveAnswers();
    }
  }, [step, answers, steps.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-100 flex items-center justify-center p-6">
      <Suspense fallback={null}>
        <HeartBackground />
      </Suspense>
      <div className="relative w-full max-w-3xl">
        <FloatingOrbs />
        <ThemedCard>
          <Sparkles count={18} />
          <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>
        </ThemedCard>
        <FairyFooter />
      </div>
    </div>
  );
}
