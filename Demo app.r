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

# Set page config with background image
st.set_page_config(page_title="Prapanch Kokkalemada - Portfolio", page_icon=":briefcase:", layout="centered")

def add_bg_from_local(image_file):
    with open(image_file, "rb") as image:
        data = image.read()
    b64 = base64.b64encode(data).decode()
    bg_img = f"""
    <style>
    .stApp {{
        background-image: url("data:image/jpg;base64,{b64}");
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    }}
    </style>
    """
    st.markdown(bg_img, unsafe_allow_html=True)

# Add background image
add_bg_from_local("C:/Users/prapa/OneDrive/Documents/VB Python/Portfolio/MSU.jpg")

# Sidebar with contact info
with st.sidebar:
    st.title("Prapanch Kokkalemada")
    st.write("East Lansing, MI | (416) 833-3040")
    st.write("[LinkedIn](https://www.linkedin.com/in/prapanchkokkalemada/)")
    st.write("kokkalem@msu.edu")

# Load profile picture
profile_pic = Image.open("C:/Users/prapa/OneDrive/Documents/VB Python/Portfolio/professional.jpg")

# Display profile picture in round frame
st.markdown(
    """
    <style>
    .profile-pic {
        display: block;
        margin-left: auto;
        margin-right: auto;
        border-radius: 50%;
        width: 150px;
        height: 150px;
        object-fit: cover;
        border: 5px solid white;
    }
    </style>
    """,
    unsafe_allow_html=True,
)
st.image(profile_pic, width=150, use_column_width=False, caption="Prapanch Kokkalemada")

# Main content
st.title("Prapanch Kokkalemada")
st.write("## Master of Business Administration (STEM Designated), Supply Chain Management")
st.write("### Michigan State University - Broad College of Business")
st.write("07/2024 - 05/2026")
st.write("**Global Career Initiative - Student Ambassador**")

# Education Section
st.write("---")
if lottie_education:
    st_lottie(lottie_education, height=150, key="education")
st.write("### Education")
st.write("- **Bachelor of Engineering, Civil Engineering**")
st.write("  - National Institute of Engineering (NIE), India (07/2015-07/2020)")
st.write("  - Research Project: Structural integrity of reinforced concrete under extreme temperatures (up to 800℃)")
st.write("  - Design Project: Comprehensive structural design plans for an environmentally friendly residential home")
st.write("  - Led a team of 20 students to secure ₹750K in funds for the annual cultural festival (TechNIEks 2018, 2019)")

# Experience Section
st.write("---")
if lottie_experience:
    st_lottie(lottie_experience, height=150, key="experience")
st.write("### Professional Experience")
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

# Skills Section
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
    <style>
    .footer-icons {
        display: flex;
        justify-content: center;
        padding: 10px 0;
    }
    .footer-icons a {
        margin: 0 15px;
    }
    </style>
    <div class="footer-icons">
        <a href="https://www.linkedin.com/in/prapanchkokkalemada/" target="_blank">
            <img src="https://img.icons8.com/fluency/48/000000/linkedin.png" alt="LinkedIn">
        </a>
        <a href="mailto:kokkalem@msu.edu">
            <img src="https://img.icons8.com/fluency/48/000000/email.png" alt="Email">
        </a>
    </div>
    """,
    unsafe_allow_html=True,
)
