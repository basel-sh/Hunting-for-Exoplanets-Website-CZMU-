import React from "react";
import "./StoryPage.css"; // أنشئي CSS إذا أردتِ تصميمًا (انظر أدناه)

const StoryPage = () => {
  return (
    <div className="story-container">
      <h1>story of explore planets with CZMU </h1>
      <p>.......</p>
      
      {/* الفيديو – غيري src إلى مسار فيديوكِ */}
      <video 
        controls 
        autoPlay 
        muted 
        style={{ width: "100%", maxWidth: "800px", height: "auto" }}
      >
        <source src="/video/story.mp4" type="video/mp4" />
        متصفحك لا يدعم الفيديو. جرب تحميل الفيديو مباشرة.
      </video>
      
      {/* إذا أردتِ embed من YouTube بدلاً من فيديو محلي: */}
      {/* <iframe 
        width="800" 
        height="450" 
        src="https://www.youtube.com/embed/YOUR_VIDEO_ID" 
        title="قصة المشروع" 
        frameBorder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowFullScreen
      ></iframe> */}
    </div>
  );
};

export default StoryPage;