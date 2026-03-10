import { AbilityBuilder, Ability } from '@casl/ability'

export const AppAbility = Ability

/**
 * Please define your own Ability rules according to your app requirements.
 * We have just shown Admin and Client rules for demo purpose where
 * admin can manage everything and client can just visit ACL page
 */
const defineRulesFor = (role="ADMIN", subject) => {
  const { can, rules } = new AbilityBuilder(AppAbility)
  if (role === 'ADMIN') {
    can('manage', 'all')
  } else if (role === 'MANAGER' || role === 'HR') {
    can('read', 'dashboard')
    can('read', 'employees')
    can('read', 'attendance')
    can('read', 'leaves')
    can('manage', 'payrolls')
    can('read', 'holidays')
    can('read', 'settings')
  } else if (role === 'EMPLOYEE') {
    can('read', 'dashboard')
    can('read', 'attendance')
    can('read', 'leaves')
    can('read', 'holidays')
  } else {
    can(['read', 'create', 'update', 'delete'], subject)
  }

  return rules
}

export const buildAbilityFor = (role="ADMIN", subject) => {
  return new AppAbility(defineRulesFor(role, subject), {
    // https://casl.js.org/v5/en/guide/subject-type-detection
    // @ts-ignore
    detectSubjectType: object => object.type
  })
}

export const defaultACLObj = {
  action: 'manage',
  subject: 'all'
}

export default defineRulesFor
