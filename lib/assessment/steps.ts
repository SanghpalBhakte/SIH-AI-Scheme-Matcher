import type { DraftEntrepreneurProfile } from '@/lib/matching/types'

// Single source of truth for the assessment wizard's step structure.
// The step shell and the real form fields (app/assessment/page.tsx)
// both read from this list — add/reorder a step here and both stay in
// sync automatically.
//
// `fields` is typed against the full DraftEntrepreneurProfile (not
// just the engine-consumed EntrepreneurProfile) because most steps
// also collect fields the matching engine doesn't read yet — see
// lib/matching/types.ts's AdditionalProfileDetails doc comment for why
// those are still collected honestly rather than left out.

export interface AssessmentStep {
  id: string
  title: string
  description: string
  /** Profile fields this step is responsible for collecting. */
  fields: (keyof DraftEntrepreneurProfile)[]
}

export const ASSESSMENT_STEPS: AssessmentStep[] = [
  {
    id: 'basic',
    title: 'Basic profile',
    description: 'Category, gender, and state directly narrow down which schemes apply to you.',
    fields: [
      'fullName',
      'age',
      'gender',
      'state',
      'district',
      'locationType',
      'category',
      'disabilityStatus',
      'minorityStatus',
      'educationLevel',
    ],
  },
  {
    id: 'business',
    title: 'Business information',
    description: 'Sector, stage, and first-time status narrow schemes down to your kind of business.',
    fields: [
      'businessName',
      'businessType',
      'sector',
      'stage',
      'yearsInOperation',
      'numberOfEmployees',
      'annualTurnoverLakh',
      'businessLocation',
      'registrationStatus',
      'firstTimeEntrepreneur',
    ],
  },
  {
    id: 'financial',
    title: 'Financial information',
    description: 'Income (optional) can match income-capped schemes; the rest helps us understand your needs.',
    fields: [
      'annualIncomeRange',
      'investmentRequiredLakh',
      'existingLoan',
      'fundingRequirementLakh',
      'creditRequirement',
      'subsidyRequirement',
    ],
  },
  {
    id: 'needs',
    title: 'Business needs',
    description: 'Select everything that applies. This helps us understand what kind of support you need.',
    fields: ['businessNeeds'],
  },
]
