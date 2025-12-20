import React, { useState } from 'react';

const categories = [
    "All",
    "Music",
    "Gaming",
    "Live",
    "Programming",
    "News",
    "Sports",
    "Learning",
    "Fashion",
    "Comedy",
    "Movies",
    "Technology"
];

function CategoryPills() { // In a real app, this would filter the list
    const [active, setActive] = useState("All");

    return (
        <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar sticky top-[64px] bg-[#0f0f0f] z-30 pt-4 px-2 -mx-2">
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => setActive(category)}
                    className={`
            px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
            ${active === category
                            ? 'bg-white text-black'
                            : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'}
          `}
                >
                    {category}
                </button>
            ))}
        </div>
    );
}

export default CategoryPills;
