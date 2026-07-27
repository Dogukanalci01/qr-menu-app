import { redirect } from 'next/navigation';

export default function Home() {
  // Ana adrese giren kişiyi direkt varsayılan restorana yönlendirir
  redirect('/menu/livadya-restaurant');
}
