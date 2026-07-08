import React, { useState, useEffect } from "react";
import { BiSolidLeftArrowAlt, BiSolidRightArrowAlt } from "react-icons/bi";
import { RxDotFilled } from "react-icons/rx";

const Hero = () => {
  const slider = [
    {
      url: "https://res.cloudinary.com/dseka2tse/image/upload/v1716788530/926e88c1-dce0-44a5-a354-b07c729d06b7_kh8alp.png",
    },
    {
      url: "https://icms-image.slatic.net/images/ims-web/cbd29b34-92bf-4889-b37b-6d39722ef118.gif"
    },
    {
      url: "https://icms-image.slatic.net/images/ims-web/8738a9f8-aec3-495a-96f3-c8e116f666ef.jpg"
    },
    {
      url: "https://icms-image.slatic.net/images/ims-web/08eedd9f-b740-4fe3-92ab-b732beab309c.jpeg"
    },
    {
      url: "https://icms-image.slatic.net/images/ims-web/b289b623-760e-48b8-ae47-e82314e3972c.jpg"
    },
    
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slider.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentIndex === slider.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 2000); // Change slide two  seconds
    return () => clearInterval(timer); // Cleanup the timer on component unmount
  }, [currentIndex]);

  return (
    <div className="w-full h-[350px] sm:h-[450px] p-[15px] box-border relative group">
      <div
        style={{ backgroundImage: `url(${slider[currentIndex].url})` }}
        className="w-full h-full bg-center bg-cover duration-500 rounded-2xl object-contain "
      >
        {/* Left Arrow */}
        <div
          className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer"
          onClick={prevSlide}
        >
          <BiSolidLeftArrowAlt size={30} />
        </div>
        {/* Right Arrow */}
        <div
          className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer"
          onClick={nextSlide}
        >
          <BiSolidRightArrowAlt size={30} />
        </div>
      </div>
      <div className="flex justify-center py-2">
        {slider.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            className="text-2xl cursor-pointer"
          >
            <RxDotFilled size={30} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hero;
