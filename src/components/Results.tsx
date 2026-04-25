import { useState } from "react";
import type { SimulationResult } from "../types/festival";
import { ResultsSlide1Turnout } from "./results/ResultsSlide1Turnout";
import { ResultsSlide2Experience } from "./results/ResultsSlide2Experience";
import { ResultsSlide3Financials } from "./results/ResultsSlide3Financials";
import { ResultsSlide4Verdict } from "./results/ResultsSlide4Verdict";

interface ResultsProps {
  result: SimulationResult;
  onBack: () => void;
}

export function Results({ result, onBack }: ResultsProps) {
  const [currentSlide, setCurrentSlide] = useState(1);

  const slides = [
    { number: 1, title: "The Turnout" },
    { number: 2, title: "The Experience" },
    { number: 3, title: "The Financials" },
    { number: 4, title: "The Verdict" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {result.config.festival.name}
            </h1>
            <p className="text-sm text-slate-400">Simulation Results</p>
          </div>
          <button
            onClick={onBack}
            className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600"
          >
            Back to Configurator
          </button>
        </div>
      </div>

      {/* Slide Navigation */}
      <div className="border-b border-slate-700 bg-slate-800 px-6 py-4">
        <div className="mx-auto flex max-w-6xl gap-2">
          {slides.map((slide) => (
            <button
              key={slide.number}
              onClick={() => setCurrentSlide(slide.number)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                currentSlide === slide.number
                  ? "bg-white text-slate-900"
                  : "bg-slate-700 text-white hover:bg-slate-600"
              }`}
            >
              {slide.number}. {slide.title}
            </button>
          ))}
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex min-h-[calc(100vh-180px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl">
          {currentSlide === 1 && (
            <ResultsSlide1Turnout result={result} />
          )}
          {currentSlide === 2 && (
            <ResultsSlide2Experience result={result} />
          )}
          {currentSlide === 3 && (
            <ResultsSlide3Financials result={result} />
          )}
          {currentSlide === 4 && (
            <ResultsSlide4Verdict result={result} onBack={onBack} />
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-slate-700 bg-slate-900 px-6 py-4">
        <div className="mx-auto flex max-w-6xl justify-between">
          <button
            onClick={() => setCurrentSlide(Math.max(1, currentSlide - 1))}
            disabled={currentSlide === 1}
            className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-slate-600"
          >
            ← Previous
          </button>
          <span className="text-sm text-slate-400">
            Slide {currentSlide} of {slides.length}
          </span>
          <button
            onClick={() =>
              setCurrentSlide(Math.min(slides.length, currentSlide + 1))
            }
            disabled={currentSlide === slides.length}
            className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-slate-600"
          >
            Next →
          </button>
        </div>
      </div>
    </main>
  );
}
