"use client";
import React, { useState } from "react";
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

// import { language, setLanguage } from "@/app/Components/Navbar"; // Import the exported variables
interface FooterProps {
  language: string;
}

const Footer: React.FC<FooterProps> = ({ language }) => {
  // const [language, setLanguage] = useState("EN");

  // const { language, changeLanguage } = useLanguage();
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // This provides a smooth scrolling effect
    });
  };

  const urduNavs = [
    "پسندیدہ",
    "شاعر",
    "آشار",
    "ای-بکس",
    "غزلیں",
    "نظمیں",
    "بلاگز",
    "انٹرویوز",
  ];

  const englishNavs = [
    "Favorites",
    "Poet",
    "Verses",
    "E-Books",
    "Ghazals",
    "Poems",
    "Blogs",
    "Interviews",
  ];

  const hindiNavs = [
    "पसंदीदा",
    "कवि",
    "छंद",
    "ई-बुक्स",
    "ग़ज़लें",
    "कविताएँ",
    "ब्लॉग्स",
    "साक्षात्कार",
  ];

  const NavsToDisplay =
    language === "EN" ? englishNavs : language === "HI" ? hindiNavs : urduNavs;

  const linksByLanguage: Record<string, string[]> = {
    UR: ["صفحہ کی معلومات", "مالک کی معلومات", "پروگرامز"],
    EN: ["About_site", "About_owner", "Programs"],
    HI: ["साइट के बारे में", "मालिक के बारे में", "कार्यक्रम"],
  };

  const linksToDisplay = linksByLanguage[language] || [];
  return (
    <footer className="bg-[#F0D586] p-10 text-[#984A02]">
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Navigation Links and Contact Info */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Navigation</Typography>
            <List id="navelems" className="">
              {NavsToDisplay.map((item) => (
                <Link href={`/${item}`} key={item}>
                  <ListItem button onClick={scrollToTop}>
                    <ListItemText primary={item} />
                  </ListItem>
                </Link>
              ))}
            </List>
            <Typography variant="h6">Contact Info</Typography>
            <address>
              <p>123 Main Street</p>
              <p>City, Country</p>
              <p>Email: example@example.com</p>
              <p>Phone: +123 456 789</p>
            </address>

            {/* Contact Form */}
            <Typography variant="h6">Contact Us</Typography>
            <form id="contact">
              <TextField label="Name" fullWidth margin="normal" />
              <TextField label="Email" fullWidth margin="normal" />
              <TextField
                label="Message"
                fullWidth
                multiline
                rows={4}
                margin="normal"
              />
              <Button variant="contained" color="primary">
                Send
              </Button>
            </form>
          </Grid>

          {/* Quick Links, Socials, and Copyright */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Quick Links</Typography>
            <List id="navelems" className="">
              {linksToDisplay.map((item) => (
                <Link href={`/${item}`} key={item}>
                  <ListItem button onClick={scrollToTop}>
                    <ListItemText primary={item} />
                  </ListItem>
                </Link>
              ))}
            </List>

            {/* Social Media Links */}
            <Typography variant="h6">Follow Us on</Typography>
            <div>
              <IconButton>
                <Link href="https://www.facebook.com/profile.php?id=61555317448004&mibextid=ZbWKwL">
                  <FacebookIcon />
                </Link>
              </IconButton>
              <IconButton>
                <Link href="https://www.instagram.com/jahannuma_official?igsh=aDdhdXV6OWtmZzRt">
                  <InstagramIcon />
                </Link>
              </IconButton>
              <IconButton>
                <Link href="#">
                  <TwitterIcon />
                </Link>
              </IconButton>
              <IconButton>
                <Link href="#">
                  <LinkedInIcon />
                </Link>
              </IconButton>
            </div>

            {/* Copyright Notice */}
            <Typography variant="body2" align="center" className="bottom-0">
              &copy; 2023 JahanNuman. All Rights Reserved.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </footer>
  );
};

export default Footer;
