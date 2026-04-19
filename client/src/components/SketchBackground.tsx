// SketchBackground — High-performance local animation engine
import React, { useEffect, useRef } from 'react';

const SketchBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            width = (canvas.width = window.innerWidth);
            height = (canvas.height = window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        const shapes: any[] = [];
        const colors = ['#7c3aed', '#2dd4bf', '#fb7185', '#fbbf24'];
        
        const createShape = () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 60 + 20,
            speedX: (Math.random() - 0.5) * 0.8,
            speedY: (Math.random() - 0.5) * 0.8,
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: Math.random() * 0.4 + 0.2,
            type: Math.random() > 0.5 ? 'circle' : 'square',
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.02
        });

        for (let i = 0; i < 30; i++) shapes.push(createShape());

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            
            shapes.forEach(s => {
                ctx.save();
                ctx.globalAlpha = s.opacity;
                ctx.strokeStyle = s.color;
                ctx.lineWidth = 2;
                ctx.translate(s.x, s.y);
                ctx.rotate(s.rotation);

                if (s.type === 'circle') {
                    ctx.beginPath();
                    ctx.arc(0, 0, s.size, 0, Math.PI * 2);
                    ctx.stroke();
                } else {
                    ctx.strokeRect(-s.size/2, -s.size/2, s.size, s.size);
                }
                
                ctx.restore();

                s.x += s.speedX;
                s.y += s.speedY;
                s.rotation += s.rotSpeed;

                if (s.x < -150) s.x = width + 150;
                if (s.x > width + 150) s.x = -150;
                if (s.y < -150) s.y = height + 150;
                if (s.y > height + 150) s.y = -150;
            });

            requestAnimationFrame(draw);
        };

        const animId = requestAnimationFrame(draw);
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-60" />;
};

export default SketchBackground;
