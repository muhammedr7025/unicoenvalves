import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <LoadingSpinner size="xl" color="text-purple-600" />
            <p className="mt-4 text-gray-600 font-medium animate-pulse">Loading...</p>
        </div>
    );
}
