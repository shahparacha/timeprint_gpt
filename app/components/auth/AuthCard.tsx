const AuthCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
      <div className="card-neumorphic w-full max-w-[500px] p-8">
        {children}
      </div>
    </div>
  );
};

export default AuthCard; 