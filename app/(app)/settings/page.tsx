import { redirect } from 'next/navigation';

export default function SettingsProfilePage() {
  redirect('/settings/platform');
  return null
}
