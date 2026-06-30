export function BackgroundGradient() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      <style jsx>{`
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-float {
          animation: float 20s infinite ease-in-out;
        }
      `}</style>

      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] animate-float" style={{ animationDelay: '-5s' }} />
      <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-purple-500/5 blur-[100px] animate-float" style={{ animationDelay: '-10s' }} />
      
      <div 
        className="absolute inset-0 opacity-[0.15] dark:opacity-[0.05] pointer-events-none" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(128, 128, 128, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(128, 128, 128, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
          backgroundPosition: 'center center'
        }}
      />
    </div>
  );
}