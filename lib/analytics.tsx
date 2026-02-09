import Script from 'next/script';

interface GoogleAnalyticsProps {
    measurementId: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
    if (!measurementId) {
        return null;
    }

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${measurementId}', {
                        page_path: window.location.pathname,
                    });
                `}
            </Script>
        </>
    );
}

// Helper function to track custom events
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, eventParams);
    }
}

// Predefined event tracking functions
export const analytics = {
    trackPackSelected: (packId: string, packName: string) => {
        trackEvent('pack_selected', {
            pack_id: packId,
            pack_name: packName,
        });
    },

    trackImageUploaded: (jobId: string) => {
        trackEvent('image_uploaded', {
            job_id: jobId,
        });
    },

    trackGenerationStarted: (jobId: string, styleKey: string) => {
        trackEvent('generation_started', {
            job_id: jobId,
            style_key: styleKey,
        });
    },

    trackPaymentInitiated: (jobId: string, amount: number, currency: string) => {
        trackEvent('begin_checkout', {
            job_id: jobId,
            value: amount / 100,
            currency: currency,
        });
    },

    trackPaymentCompleted: (jobId: string, amount: number, currency: string) => {
        trackEvent('purchase', {
            job_id: jobId,
            transaction_id: jobId,
            value: amount / 100,
            currency: currency,
        });
    },

    trackDownloadCompleted: (jobId: string) => {
        trackEvent('download_completed', {
            job_id: jobId,
        });
    },
};
