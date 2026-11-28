import React from "react";

export interface RoommateIntroProps {
  children?: React.ReactNode;
}

export function RoommateIntro({ children }: RoommateIntroProps) {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="font-heading text-title sm:text-display font-semibold text-ink">
          Find a roommate
        </h1>
        <p className="text-body text-ink max-w-2xl leading-relaxed">
          Roommate matching pairs you with students in your city who have an overlapping budget, a similar move-in date and compatible living habits.
        </p>
        <p className="text-body text-muted-ink max-w-2xl leading-relaxed">
          Other students only see your first name and last initial, your preferences and your bio. Phone numbers and emails are shared only after you both accept a roommate request.
        </p>
      </section>

      {children}
    </div>
  );
}
