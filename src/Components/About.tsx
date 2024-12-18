import React from 'react';

const About: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Sobre mí</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Bienvenido a Ariels Store. Soy un apasionado desarrollador web con experiencia en la creación de aplicaciones modernas y funcionales. Mi objetivo es ofrecer la mejor experiencia de compra en línea a nuestros clientes.
      </p>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        En esta tienda, encontrarás una variedad de productos cuidadosamente seleccionados para satisfacer tus necesidades. Estoy comprometido a brindar un excelente servicio al cliente y asegurarme de que cada compra sea satisfactoria.
      </p>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarme. ¡Gracias por visitar Ariels Store!
      </p>
    </div>
  );
};

export default About;