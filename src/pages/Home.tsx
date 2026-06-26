import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, BookOpen, Mic } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 w-full">
      {/* Hero Section */}
      <section className="relative bg-blue-50 py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <Mic className="h-20 w-20 text-blue-600" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6">
            IMA Studio du SCOP
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
            L'espace créatif professionnel pour vos enregistrements, podcasts, réunions et formations.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/reservation"
              className="rounded-md bg-blue-600 px-8 py-4 text-lg font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
            >
              Réserver le studio
            </Link>
            <Link
              to="/formations"
              className="rounded-md bg-white px-8 py-4 text-lg font-medium text-blue-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
            >
              Découvrir les formations
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="p-6 bg-blue-50 rounded-2xl">
              <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Réservation simple</h3>
              <p className="text-gray-600">Réservez le studio en quelques clics selon vos besoins et notre calendrier interactif.</p>
            </div>
            <div className="p-6 bg-blue-50 rounded-2xl">
              <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Formations expertes</h3>
              <p className="text-gray-600">Participez à nos formations professionnelles pour développer vos compétences.</p>
            </div>
            <div className="p-6 bg-blue-50 rounded-2xl">
              <Mic className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Matériel Pro</h3>
              <p className="text-gray-600">Profitez d'un équipement de pointe pour vos podcasts, vidéos et shootings.</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-12 bg-blue-600 text-white text-center">
        <h2 className="text-2xl font-semibold">Bienvenue à IMA Studio</h2>
      </section>
    </div>
  );
}
