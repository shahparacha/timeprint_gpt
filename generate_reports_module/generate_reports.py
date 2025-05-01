import os
import time
from dotenv import load_dotenv
import google.generativeai as genai
import datetime

# Load environment variables
load_dotenv()

# Set up Google Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

    # Define the format template for construction reports
construction_report_format = """
You are a specialized AI assistant for construction managers and project managers.
    
You will be given a  video where a construction worker is wearing a helmet with a GoPro camera attached to it and the video is being streamed live in a POV (point of view) format.
    
When given a video, you will analyze them and provide a detailed report on what is happening at the construction site.
    
For the per five second analysis, group your observations in 5-second increments.
For each five seconds, describe what the construction worker is doing, what materials they used in that moment if any, and what tools they used in that moment, if any, along with the action of the tool that was taken.
    
For instance, when they shoot a nail with a nail gun into a piece of wood, you will report: "Tool used: nail gun (1 time)" or if the nail gun was used 3 times in 5 seconds it will say "Tool used: nail gun (3 times)", etc.
    
Your report will follow this format:
    
# SITE PROGRESS REPORT
    
## Date and Time
[Insert date and time of the video analysis]
    
## Site Overview
[Provide a brief description of what is visible in the frames]
    
## Work Completed
[List observable completed work]
    
## Work In Progress
[List observable ongoing work]
    
## Materials On Site Visible By This Worker's Camera
[List visible materials and equipment]
    
## Safety Observations
[Note any visible safety measures or concerns]
    
## Recommendations
[Provide actionable recommendations based on the frames]
    
## Weather Conditions
[Note visible weather conditions]
    
## Second by Second Video Analysis
[Provide a detailed second by second analysis]
- [Second 0-5]: [Description of action, materials used, tools used]
- [Second 5-10]: [Description of action, materials used, tools used]
- [Second 10-15]: [Description of action, materials used, tools used]
...
    
Maintain a professional tone throughout the report using construction industry specific terminology.
"""

class ConstructionVideoAnalyzer:
    def __init__(self, model_name="gemini-2.5-pro-exp-03-25"):
        """Initialize the analyzer with the specified model."""
        self.model = genai.GenerativeModel(model_name)
        
    def analyze_video(self, video_path: str) -> str:
        """
        Analyze a construction video and generate a report.
        
        Args:
            video_path: Path to the video file
            
        Returns:
            Generated report as a string
        """
        print(f"Analyzing video: {video_path}")
        
        try:
            # Read the video file
            print("Reading video file...")
            read_start_time = time.time()
            
            with open(video_path, "rb") as f:
                video_data = f.read()
                
            read_elapsed = time.time() - read_start_time
            print(f"Video file read in {read_elapsed:.2f} seconds.")
            
            # Generate the report
            print("Sending video to Gemini API for analysis...")
            api_start_time = time.time()
            
            # Configure generation parameters
            generation_config = {
                "temperature": 0.1,
                "top_p": 0.1,
                "top_k": 15,
                "max_output_tokens": 10000000,
            }
            
            # Use Gemini 2.5 Pro for enhanced video understanding
            response = self.model.generate_content(
                [
                    {
                        "text": construction_report_format + "\n\nThe video file has been provided. Please analyze the construction site footage as instructed."
                    },
                    {
                        "mime_type": "video/mp4",
                        "data": video_data
                    }
                ],
                generation_config=generation_config
            )
            
            api_elapsed = time.time() - api_start_time
            print(f"API analysis completed in {api_elapsed:.2f} seconds.")
            
            return response.text
            
        except Exception as e:
            print(f"Error during analysis: {e}")
            return f"Error during analysis: {str(e)}"

def main():
    # Start timing the entire process
    total_start_time = time.time()
    
    # Get the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Specific video file to analyze
    video_filename = "video3.mp4"
    video_path = os.path.join(current_dir, video_filename)
    
    # Check if the specified video file exists
    if not os.path.exists(video_path):
        print(f"Error: The specified video file '{video_filename}' does not exist in the current directory.")
        return
    
    print(f"Using video file: {video_filename}")
    
    # Create analyzer and analyze the video
    analyzer = ConstructionVideoAnalyzer()
    report = analyzer.analyze_video(video_path)
    
    # Get current date and time for the report filename
    current_datetime = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Save the report to a file
    report_filename = f"construction_report_{os.path.splitext(video_filename)[0]}_{current_datetime}.md"
    report_path = os.path.join(current_dir, report_filename)
    
    with open(report_path, 'w') as f:
        f.write(report)
    
    # Calculate and display total execution time
    total_elapsed = time.time() - total_start_time
    
    # Format the time nicely
    hours, remainder = divmod(int(total_elapsed), 3600)
    minutes, seconds = divmod(remainder, 60)
    
    print(f"Report generated and saved to: {report_path}")
    print(f"\n----- Execution Summary -----")
    print(f"Total execution time: {hours:02d}:{minutes:02d}:{seconds:02d} (HH:MM:SS)")
    print(f"Total seconds: {total_elapsed:.2f}")
    
    if hours > 0:
        time_str = f"{hours} hours, {minutes} minutes, and {seconds} seconds"
    elif minutes > 0:
        time_str = f"{minutes} minutes and {seconds} seconds"
    else:
        time_str = f"{total_elapsed:.2f} seconds"
    
    print(f"Script completed in {time_str}")

if __name__ == "__main__":
    main()