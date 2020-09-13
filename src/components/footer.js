import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faAngleDoubleRight,
  faQuestionCircle,
  faPodcast,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons"
import {
  faFacebookSquare,
  faTwitterSquare,
  faInstagramSquare,
  faLinkedin,
  faTwitter
} from "@fortawesome/free-brands-svg-icons"

export default function Footer() {
  return (
    <footer>
      <div className="flex flex-col md:flex-row py-12 px-12 mt-3 text-grey bg-lightgrey space-y-10 md:space-y-0 md:space-x-10">
        <div className="flex-1 px-2">
          <div className="font-title mb-3 font-bold text-2xl">
            <span className="block text-sm font-title uppercase">
              <FontAwesomeIcon
                icon={faAngleDoubleRight}
                className="text-teal mr-1"
              />
              About
            </span>
            This dataset on{" "}
            <a
              href="http://www.uwri.org/2-1-1/"
              target="_blank"
              rel="noopener"
              className="hover:text-teal no-underline"
            >
              211
              <FontAwesomeIcon icon={faQuestionCircle} size="sm" className="ml-2" />
            </a>
          </div>
          <div className="font-text text-base">
            This dashboard uses data on calls related to COVID-19 from United
            Way of Rhode Island’s 211 system, a free and confidential resource
            that connects Rhode Islanders with resources such as housing, food,
            and affordable childcare. The data is anonymized to protect the
            identity of callers and includes fields about the date of the call,
            a category for the purpose of the call, and the caller’s
            self-identified municipality and Zip Code.
          </div>
        </div>
        <div className="flex-1 px-2">
          <div className="font-title mb-3 font-bold text-2xl">
            <span className="block text-sm font-title uppercase">
              <FontAwesomeIcon
                icon={faAngleDoubleRight}
                className="text-teal mr-1"
              />
              About
            </span>
            <a
              href="https://www.uwri.org"
              target="_blank"
              rel="noopener"
              color="inherit"
              underline="none"
              className="hover:text-teal"
            >
              United Way of Rhode Island{" "}
              <FontAwesomeIcon icon={faPaperPlane} size="sm" className="ml-2" />
            </a>
          </div>
          <div className="font-text text-base">
            United Way of Rhode Island makes it possible for Rhode Islanders to
            get help, and give back. Working with a broad range of partners,
            they invest in proven programs that help children fall in love with
            learning, train adults for careers, and provide childcare and other
            essentials to families. In addition, they give Rhode Islanders one
            number to call in a crisis – 211.
          </div>
          <div className="mt-8 space-x-1">
            <a
              href="https://www.facebook.com/LiveUnitedRI"
              target="_blank"
              rel="noopener"
              className="hover:text-teal"
            >
              <FontAwesomeIcon icon={faFacebookSquare} size="2x" />
            </a>
            <a
              href="https://twitter.com/liveunitedri?lang=en"
              target="_blank"
              rel="noopener"
              className="hover:text-teal"
            >
              <FontAwesomeIcon icon={faTwitterSquare} size="2x" />
            </a>
            <a
              href="https://www.instagram.com/liveunitedri/hl=en"
              target="_blank"
              rel="noopener"
              className="hover:text-teal"
            >
              <FontAwesomeIcon icon={faInstagramSquare} size="2x" />
            </a>
            <a
              href="https://www.linkedin.com/company/united-way-of-rhode-island"
              target="_blank"
              rel="noopener"
              className="hover:text-teal"
            >
              <FontAwesomeIcon icon={faLinkedin} size="2x" />
            </a>
          </div>
        </div>
        <div className="flex-1 px-2">
          <div className="font-title mb-3 font-bold text-2xl">
            <span className="block text-sm font-title uppercase">
              <FontAwesomeIcon
                icon={faAngleDoubleRight}
                className="text-teal mr-1"
              />
              About
            </span>
            <a
              href="https://thepolicylab.brown.edu"
              target="_blank"
              rel="noopener"
              className="hover:text-teal"
            >
              The Policy Lab
              <FontAwesomeIcon icon={faPaperPlane} size="sm" className="ml-2" />
            </a>
          </div>
          <div className="font-text text-base">
            The Policy Lab brings together experts from government,
            universities, and community organizations to collaborate on research
            to inform decisions about how to improve policies and programs
            across Rhode Island and beyond.
          </div>
          <div className="mt-8 space-x-1">
            <a
              href="https://twitter.com/thepolicytweets?lang=en"
              target="_blank"
              rel="noopener"
              className="hover:text-teal"
            >
              <FontAwesomeIcon icon={faTwitter} size="2x" />
            </a>
            <a
              href="https://thirtythousandleagues.com/"
              target="_blank"
              rel="noopener"
              className="hover:text-teal"
            >
              <FontAwesomeIcon icon={faPodcast} size="2x" />
            </a>
          </div>
        </div>
      </div>
      <div className="bg-darkgrey text-base text-white py-6 px-12">
        &copy; 2020 | United Way of Rhode Island & The Policy Lab at Brown
        University
      </div>
    </footer>
  )
}
