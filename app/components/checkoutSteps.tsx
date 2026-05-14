import Link from "next/link";
import { FaCheck } from "react-icons/fa";

type CheckoutStep = {
    label: string;
    href: string;
};

type CheckoutStepsProps = {
    currentStep: number;
};

const steps: CheckoutStep[] = [
    { label: "Delivery Address", href: "/checkout/delivery-address" },
    { label: "Delivery Schedule", href: "/checkout/delivery-schedule" },
    { label: "Payment Method", href: "/checkout/payment-method" },
    { label: "Review", href: "/checkout/review" },
];

const CheckoutSteps = ({ currentStep }: CheckoutStepsProps) => {
    return (
        <nav aria-label="Checkout progress" className="w-full">
            <ol className="grid grid-cols-4 gap-2">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isComplete = stepNumber < currentStep;

                    return (
                        <li key={step.href} className="relative">
                            {index < steps.length - 1 && (
                                <div className="absolute left-1/2 top-5 hidden h-0.5 w-full bg-gray-300 md:block dark:bg-zinc-700" />
                            )}
                            <Link
                                href={step.href}
                                aria-current={isActive ? "step" : undefined}
                                className="relative z-10 flex flex-col items-center gap-2 text-center"
                            >
                                <span
                                    className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold ${
                                        isComplete
                                            ? "border-green-700 bg-green-700 text-white"
                                            : isActive
                                                ? "border-orange-600 bg-orange-600 text-white dark:border-amber-300 dark:bg-amber-300 dark:text-black"
                                                : "border-gray-300 bg-white text-gray-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-300"
                                    }`}
                                >
                                    {isComplete ? <FaCheck size={14} /> : stepNumber}
                                </span>
                                <span
                                    className={`text-xs font-semibold md:text-sm ${
                                        isActive ? "text-orange-700 dark:text-amber-200" : "text-gray-600 dark:text-gray-300"
                                    }`}
                                >
                                    {step.label}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default CheckoutSteps;
