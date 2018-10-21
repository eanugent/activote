using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Activote.Models;

namespace Activote.Controllers
{
    [AllowAnonymous()]
    public class ActionController : Controller
    {
        private activoteEntities db = new activoteEntities();
        [OutputCache(Duration = 86400, VaryByParam = "*")]
        public ActionResult _RegisteredWelcome()
        {
            return PartialView();
        }

        [OutputCache(Duration = 86400, VaryByParam = "*")]
        public ActionResult _IsRegistered()
        {
            return PartialView();
        }

        [OutputCache(Duration = 86400, VaryByParam = "*")]
        public ActionResult _CheckRegistration()
        {
            return PartialView(new activoteEntities().States.OrderBy(s => s.StateName).ToList());
        }

        [OutputCache(Duration = 86400, VaryByParam = "*")]
        public ActionResult RegistrationConfirmed()
        {
            TrackedGUIDAccess.TrackedActionCompleted();
            return Json(new { success = true });
        }

        public string StateRegistrationURL(string id)
        {
            var s = db.States.FirstOrDefault(st => st.StateAbbrev == id);
            if(s != null)
            {
                return s.RegistrationURL;
            }
            else
            {
                return "";
            }
        }
        public ActionResult _ReadyWelcome()
        {
            return PartialView();
        }
        
        /*********************** Begin Ready Actions ***********************************/
        public ActionResult _Ready()
        {
            return PartialView();
        }

        public ActionResult _EarlyVotingLoc(EarlyVotingLocViewModel md)
        {
            return PartialView(md);
        }

        /*********************** End Ready Actions ***********************************/

        [OutputCache(Duration = 86400, VaryByParam = "*")]
        public ActionResult _UploadImageView()
        {
            return PartialView();
        }

        [OutputCache(Duration = 60, VaryByParam = "*")]
        public ActionResult _ChooseFrame(string actionTag)
        {
            var frmID = db.Actions.FirstOrDefault(a => a.ActionTag == actionTag).DefaultFrameGUID;
            Frame defFrame = db.Frames.Find(frmID);
            ViewBag.DefaultFrameID = frmID.ToString();
            ViewBag.FrameAuthor = defFrame.FrameAuthor;
            ViewBag.FrameAuthorURL = defFrame.FrameAuthorURL;
            ViewBag.FrameBackgroundHex = defFrame.BackgroundHex;
            var md = (from f in db.Frames
                      where f.Action.ActionTag == actionTag
                      orderby f.FrameName
                      select new { aID = f.ActionID, id = f.FrameGUID, auth = f.FrameAuthor, authurl = f.FrameAuthorURL, hex = f.BackgroundHex })
                      .ToList().Select(f => new Frame() { ActionID = f.aID, FrameGUID = f.id, FrameAuthor = f.auth, FrameAuthorURL = f.authurl, BackgroundHex = f.hex }).ToList();
            return PartialView(md);
        }

        [OutputCache(Duration = 0, VaryByParam = "*")]
        public ActionResult _MakePicPublic()
        {
            return PartialView();
        }

        [ValidateAntiForgeryToken()]
        [HttpPost]
        public string BuildImage(string pic, string actionTag, Guid frameID, float x, float y, float scale, float width, float height, bool makePublic)
        {
            pic = pic.Replace("data:image/jpeg;base64,", "").Replace("data:image/png;base64,", "");

            Image img = new Bitmap(1080, 1080);

            Graphics g = Graphics.FromImage(img);
            var picBytes = Convert.FromBase64String(pic);
            var frm = db.Frames.FirstOrDefault(f => f.FrameGUID == frameID);

            g.Clear(ColorTranslator.FromHtml("#" + frm.BackgroundHex));
            g.DrawImage(Image.FromStream(new MemoryStream(picBytes)), x, y, width * scale, height * scale);

            g.DrawImage(Image.FromStream(new MemoryStream(frm.FrameBytes)), 0, 0, 1080, 1080);

            ImageCodecInfo jpgEncoder = GetEncoder(ImageFormat.Jpeg);
            System.Drawing.Imaging.Encoder myEncoder = System.Drawing.Imaging.Encoder.Quality;
            EncoderParameters myEncoderParameters = new EncoderParameters(1);
            EncoderParameter myEncoderParameter = new EncoderParameter(myEncoder, 50L);
            myEncoderParameters.Param[0] = myEncoderParameter;

            var outStream = new MemoryStream();
            img.Save(outStream, jpgEncoder, myEncoderParameters);

            var newPhoto = new Photo()
            {
                PhotoBytes = outStream.ToArray(),
                MakePublic = makePublic,
                PhotoByteSize = picBytes.Length,
                 FrameGUID = frameID
            };
            newPhoto.ActionID = db.Actions.FirstOrDefault(a => a.ActionTag == actionTag).ActionID;
            if (Person.LoggedInPersonID > -1)
            {
                newPhoto.PersonID = Person.LoggedInPersonID;
            }
            db.Photos.Add(newPhoto);
            db.SaveChanges();

            return newPhoto.PhotoGUID.ToString();
        }

        private ImageCodecInfo GetEncoder(ImageFormat format)
        {
            ImageCodecInfo[] codecs = ImageCodecInfo.GetImageDecoders();
            foreach (ImageCodecInfo codec in codecs)
            {
                if (codec.FormatID == format.Guid)
                {
                    return codec;
                }
            }
            return null;
        }

        [OutputCache(Duration = 86400, VaryByParam = "*")]
        public ActionResult _DownloadImageView(string id)
        {
            ViewBag.guid = id;
            return PartialView();
        }
    }
}