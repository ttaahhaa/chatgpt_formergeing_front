export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-2 dark:bg-[#020d1a]">
            {children}
        </div>
    );
} 