import { Star } from 'lucide-react';

export default function StarRating({ rating, onRate, readonly = false, size = 'w-5 h-5' }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onRate?.(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star
            className={`${size} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
