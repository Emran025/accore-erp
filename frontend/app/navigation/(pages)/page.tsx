import { Suspense } from "react";
import { MainLayout } from "@/components/layout";
import { NavigationGridContent } from "../components/NavigationGridContent";

export default function NavigationPage() {
    return (
        <MainLayout>
            <Suspense fallback={
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                    جاري التحميل...
                </div>
            }>
                <NavigationGridContent />
            </Suspense>
        </MainLayout>
    );
}
