import streamlit as st
from streamlit_lottie import st_lottie
import requests
from PIL import Image
import base64

# Function to load Lottie animations from URL
def load_lottieurl(url: str):
    try:
        r = requests.get(url)
        if r.status_code != 200:
            return None
        return r.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Error loading animation: {e}")
        return None

# Load animations
lottie_education = load_lottieurl("https://assets3.lottiefiles.com/packages/lf20_t4oJIZ.json")
lottie_experience = load_lottieurl("https://assets3.lottiefiles.com/packages/lf20_v7e5jhqw.json")
lottie_skills = load_lottieurl("https://assets3.lottiefiles.com/packages/lf20_zsdzgyh3.json")

# Set page config with custom title and icon
st.set_page_config(page_title="Prapanch Kokkalemada - Portfolio", page_icon=":briefcase:", layout="centered")

# Function to set background image from URL with content transparency
def add_bg_from_url(image_url):
    bg_img = f"""
    <style>
    .stApp {{
        background: url("{image_url}");
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    }}
    .main-content {{
        background-color: rgba(255, 255, 255, 0.85); /* White background with slight transparency */
        border-radius: 15px;
        padding: 20px;
    }}
    </style>
    """
    st.markdown(bg_img, unsafe_allow_html=True)

# Add background image from the provided URL
add_bg_from_url("https://broad.msu.edu/app/uploads/2020/04/Broad-Zoom-Background-1.jpg")

# Sidebar with contact info
with st.sidebar:
    st.title("Prapanch Kokkalemada")
    st.write("East Lansing, MI | (416) 833-3040")
    st.write("[LinkedIn](https://www.linkedin.com/in/prapanchkokkalemada/)")
    st.write("kokkalem@msu.edu")

# Load profile picture
profile_pic = Image.open("C:/Users/prapa/OneDrive/Documents/VB Python/Portfolio/professional.jpg")

# Display profile picture in round frame using HTML
st.markdown(
    f"""
    <div class='main-content' style='text-align: center;'>
        <img src="data:image/jpg;base64,{base64.b64encode(profile_pic.tobytes()).decode()}" alt="Profile Picture" style="border-radius: 50%; width: 150px; height: 150px; object-fit: cover; border: 5px solid white;">
    </div>
    <h1 style='text-align: center; font-family: "Poppins", sans-serif;'>Prapanch Kokkalemada</h1>
    <h3 style='text-align: center; font-family: "Roboto", sans-serif;'>Master of Business Administration (STEM Designated), Supply Chain Management</h3>
    <h4 style='text-align: center; font-family: "Roboto", sans-serif;'>Michigan State University - Broad College of Business (07/2024 - 05/2026)</h4>
    <h5 style='text-align: center;'>Global Career Initiative - Student Ambassador</h5>
    """,
    unsafe_allow_html=True,
)

# Main content section
st.markdown("<div class='main-content'>", unsafe_allow_html=True)

# Education Section with animation
st.write("---")
if lottie_education:
    st_lottie(lottie_education, height=150, key="education")
st.write("### Education")
with st.expander("Click to Expand", expanded=True):
    st.write("- **Bachelor of Engineering, Civil Engineering**")
    st.write("  - National Institute of Engineering (NIE), India (07/2015-07/2020)")
    st.write("  - Research Project: Structural integrity of reinforced concrete under extreme temperatures (up to 800℃)")
    st.write("  - Design Project: Comprehensive structural design plans for an environmentally friendly residential home")
    st.write("  - Led a team of 20 students to secure ₹750K in funds for the annual cultural festival (TechNIEks 2018, 2019)")

# Experience Section with animation
st.write("---")
if lottie_experience:
    st_lottie(lottie_experience, height=150, key="experience")
st.write("### Professional Experience")
with st.expander("Click to Expand", expanded=True):
    st.write("#### Ward Tires Inc., Calgary, AB (02/2023-08/2023)")
    st.write("- **Business Account Manager**")
    st.write("  - Identified 2 revenue streams to establish initial sales from unexplored territories (Ontario and Quebec)")
    st.write("  - Negotiated a 13% reduction in product landing cost and established a relationship with a new supplier")
    st.write("  - Engaged with 300+ logistics providers; Introduced a new brand and facilitated rebate programs with recyclable tires")
    st.write("  - Enhanced digital leads by 20% through marketing initiatives on digital platforms")
    st.write("#### Sales & Operations Coordinator (07/2021-01/2023)")
    st.write("  - Managed an 18000 sqft warehouse inventory; Analyzed real-time order position to prevent excess inventory holding")
    st.write("  - Reduced stockouts by 30% through analysis of demand curves in peak seasons and adapting to supplier lead times")
    st.write("#### Fiverr, Toronto, ON (09/2020-06/2021)")
    st.write("- **Freelance Marketing Specialist**")
    st.write("  - Improved search rankings by up to 40% through strategic keyword research, on-page optimization, and content enhancements")
    st.write("  - Generated 25% increase in website traffic via ad targeting strategies")
    st.write("#### Anand Associates LTD, India (07/2019-08/2020)")
    st.write("- **Project Supervisor**")
    st.write("  - Coordinated daily progress of 4 residential projects simultaneously as per authorized quotes and specifications")
    st.write("  - Evaluated performance of 15 workers per site and recommended a 5% reduction of workforce to increase overall efficiency")

# Skills Section with animation
st.write("---")
if lottie_skills:
    st_lottie(lottie_skills, height=150, key="skills")
st.write("### Leadership & Skills")
st.write("- **Certifications:** Supply Chain Management, Data Visualization, Sales & Distribution, Digital Marketing, Negotiation")
st.write("- **Technical Expertise:** Excel, MS Suite, Python, Photoshop, HTML, CSS, JavaScript")
st.write("- **Languages:** English (Advanced), Hindi (Advanced), Kannada (Intermediate), Punjabi (Novice), French (Novice)")
st.write("- **Hobby & Interests:** Trained Guitarist & Percussionist, Charcoal Art, Soccer")

# Footer with LinkedIn and Email Icons
st.write("---")
st.markdown(
    """
    <div style='text-align: center;'>
        <a href="https://www.linkedin.com/in/prapanchkokkalemada/" target="_blank">
            <button style='background-color: #0077b5; color: white; border-radius: 25px; padding: 10px 20px; border: none; font-family: "Roboto", sans-serif;'>
                LinkedIn
            </button>
        </a>
        <a href="mailto:kokkalem@msu.edu">
            <button style='background-color: #e74c3c; color: white; border-radius: 25px; padding: 10px 20px; border: none; font-family: "Roboto", sans-serif;'>
                Email
            </button>
        </a>
    </div>
    """,
    unsafe_allow_html=True,
)

# Floating action button for quick scroll to top
st.markdown(
    """
    <style>
    .float {
        position: fixed;
        width: 60px;
        height: 60px;
        bottom: 40px;
        right: 40px;
        background-color: #e74c3c;
        color: white;
        border-radius: 50px;
        text-align: center;
        box-shadow: 2px 2px 3px #999;
        font-size: 24px;
    }

    .my-float {
        margin-top: 16px;
    }
    </style>
    <a href="#" class="float">
        <i class="fa fa-arrow-up my-float"></i>
    </a>
    """,
    unsafe_allow_html=True,
)

st.markdown("</div>", unsafe_allow_html=True)
