import { MapPin } from 'lucide-react';

export default function Loading({ fullPage = false }) {
  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-emerald-600 animate-bounce mx-auto" />
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center py-12">
      <MapPin className="h-8 w-8 text-emerald-600 animate-bounce" />
    </div>
  );
}
