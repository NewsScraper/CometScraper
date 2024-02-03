import { Divider, Typography } from "@mui/material";
import styles from "./HomeNewsRow.module.css";
import { teal, pink } from "@mui/material/colors";
import { alpha } from '@mui/material/styles';
const decreasedRed = alpha("#ff0000", 0.675); // 0.7 is the alpha value, you can adjust it

const HomeNewsRow = (props) => {
    const { news } = props;

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", marginTop: "2.5%", }}>
        <a className={styles.newsText} href={news.href} style={{ textDecoration: "none" }}>
            <Typography variant="h7" style={{ fontFamily: "Avenir", color: "black", fontWeight: 500, textDecoration: "none", textAlign: "left" }}>
                {news.title}
            </Typography>
        </a>
        <div style={{ display: "flex", flexDirection: "row", marginTop: "1.25%", height: "1.5vh", alignItems: "center", width: "80%" }}>
          <a href={news.href} style={{ textDecoration: "none" }}>
            <Typography variant="subtitle2" style={{ fontFamily: "Avenir", color: '#1976D2' }}>{news.source}</Typography>
          </a>
          <Divider orientation="vertical" variant="middle" sx={{ height: "100%", marginRight: "2%", marginLeft: "2%" }} />
          <Typography variant="subtitle2" style={{ fontFamily: "Avenir", color: 'grey' }}>{news.date}</Typography>
        </div>
        <div style={{ display: "flex", flexDirection: "row", marginTop: "1.35%", height: "1.5vh", alignItems: "center", width: "96%" }}>
          <Typography variant="subtitle2" style={{ fontFamily: "Avenir", color: "black" }}>Sentiment Scores</Typography>
          <Divider orientation="vertical" variant="middle" sx={{ height: "100%", marginRight: "2%", marginLeft: "2%" }} />
          <Typography variant="subtitle2" style={{ fontFamily: "Avenir", color: teal[500] }}>Pos: {news.score[0][1]}</Typography>
          <Divider orientation="vertical" variant="middle" sx={{ height: "100%", marginRight: "2%", marginLeft: "2%" }} />
          <Typography variant="subtitle2" style={{ fontFamily: "Avenir", color: 'grey' }}>Neu: {news.score[2][1]}</Typography>
          <Divider orientation="vertical" variant="middle" sx={{ height: "100%", marginRight: "2%", marginLeft: "2%" }} />
          <Typography variant="subtitle2" style={{ fontFamily: "Avenir", color: decreasedRed }}>Neg: {news.score[1][1]}</Typography>
          <Divider orientation="vertical" variant="middle" sx={{ height: "100%", marginRight: "2%", marginLeft: "2%" }} />
          <Typography variant="subtitle2" style={{ fontFamily: "Avenir", color: news.score[3][1] >= 0.05 ? teal[500] : news.score[3][1] <= -0.05 ? decreasedRed : 'grey' }}>Compound: {news.score[3][1]}</Typography>
        </div>
        <Divider sx={{ width: "100%", marginTop: "2.25%" }} />
      </div>
    );
}

export default HomeNewsRow;
