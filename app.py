import streamlit as st

# Set the title and header
st.set_page_config(page_title="Your Name", page_icon=":wave:", layout="centered")
st.title("Hi, I'm Your Name :wave:")
st.subheader("Welcome to my personal webpage!")

# About Section
st.markdown("## About Me")
st.write("""
I'm a [Your Profession] with experience in [Your Skills/Industries]. I enjoy working on projects that involve [Your Interests]. 
This page is a showcase of my work and a little about me.
""")

# Projects Section
st.markdown("## Projects")
st.write("### Project 1: [Project Name](#)")
st.write("A brief description of what this project is about and what technologies were used.")
st.write("### Project 2: [Project Name](#)")
st.write("A brief description of what this project is about and what technologies were used.")
# Add more projects as needed

# Contact Section
st.markdown("## Contact")
st.write("""
Feel free to reach out to me via email at [your.email@example.com](mailto:your.email@example.com) 
or connect with me on [LinkedIn](https://www.linkedin.com/).
""")

# Footer
st.markdown("---")
st.write("© 2024 Your Name")
