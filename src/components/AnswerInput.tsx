import { useState, forwardRef, type FormEvent } from "react";

interface AnswerInputProps {
  answerLength: number;
  onSubmit: (guess: string) => void;
  disabled: boolean;
  remainingAttempts: number;
  maxAttempts: number;
}

const AnswerInput = forwardRef<HTMLInputElement, AnswerInputProps>(function AnswerInput(
  { answerLength, onSubmit, disabled, remainingAttempts, maxAttempts },
  ref
) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length !== answerLength || disabled) return;
    onSubmit(trimmed);
    setValue("");
  };

  const isValidLength = value.trim().length === answerLength;

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          placeholder={`输入 ${answerLength} 个字...`}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="flex-1 bg-white border-2 border-gray-300 rounded-xl px-4 py-3.5
            text-gray-900 text-lg placeholder-gray-400
            focus:outline-none focus:border-emerald-500 transition-all
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={disabled || !isValidLength}
          className={`font-bold px-6 py-3.5 rounded-xl transition-all
            ${
              isValidLength && !disabled
                ? "bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-lg shadow-emerald-200"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
        >
          提交
        </button>
      </form>
      <div className="flex items-center justify-between mt-2 px-1">
        <p className="text-gray-400 text-xs">
          剩余 <span className="text-gray-600 font-mono">{remainingAttempts}</span> / {maxAttempts} 次
        </p>
        {value.length > 0 && (
          <p className={`text-xs ${isValidLength ? "text-emerald-600" : "text-amber-600"}`}>
            已输入 {value.length} / {answerLength} 字
          </p>
        )}
      </div>
    </div>
  );
});

export default AnswerInput;
