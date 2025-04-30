const CenteredCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
      <div className="card-neumorphic w-full max-w-[800px] p-8 flex justify-center">
        {children}
      </div>
    </div>
  );
};

export default CenteredCard; 