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
    [AuthorizeAttribute()]
    public class ActionController : Controller
    {
        private activoteEntities db = new activoteEntities();
        // GET: Action
        public ActionResult _RegisteredWelcome()
        {
            return PartialView();
        }

        public ActionResult _IsRegistered()
        {
            return PartialView();
        }

        public ActionResult _CheckRegistration()
        {
            return PartialView(new activoteEntities().States.OrderBy(s => s.StateName).ToList());
        }

        public ActionResult RegistrationConfirmed()
        {
            TrackedGUIDAccess.TrackedActionCompleted();
            return Json(new { success = true });
        }

        public ActionResult _UploadImageView()
        {

            return PartialView();
        }

        public ActionResult _ChooseFrame(string actionTag)
        {
            ViewBag.DefaultFrameID = db.Actions.FirstOrDefault(a => a.ActionTag == actionTag).DefaultFrameGUID.ToString();
            return PartialView(db.Frames.Where(f => f.Action.ActionTag == actionTag).ToList());
        }

        public ActionResult _MakePicPublic()
        {
            return PartialView();
        }

        [ValidateAntiForgeryToken()]
        public string BuildImage(string pic, string actionTag, Guid frameID, float x, float y, float scale, float width, float height, bool makePublic)
        {
            pic = pic.Replace("data:image/jpeg;base64,", "").Replace("data:image/png;base64,", "");

            Image img = new Bitmap(1080, 1080);

            Graphics g = Graphics.FromImage(img);
            var picBytes = Convert.FromBase64String(pic);

            g.DrawImage(Image.FromStream(new MemoryStream(picBytes)), x, y, width, height);

            var frm = db.Frames.FirstOrDefault(f => f.FrameGUID == frameID);
            g.DrawImage(Image.FromStream(new MemoryStream(frm.FrameBytes)), 0, 0, 1080, 1080);

            ImageCodecInfo jpgEncoder = GetEncoder(ImageFormat.Jpeg);
            System.Drawing.Imaging.Encoder myEncoder = System.Drawing.Imaging.Encoder.Quality;
            EncoderParameters myEncoderParameters = new EncoderParameters(1);
            EncoderParameter myEncoderParameter = new EncoderParameter(myEncoder, 100L);
            myEncoderParameters.Param[0] = myEncoderParameter;

            var outStream = new MemoryStream();
            img.Save(outStream, jpgEncoder, myEncoderParameters);

            var newPhoto = new Photo()
            {
                PhotoBytes = outStream.ToArray(),
                MakePublic = makePublic
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

        public ActionResult _DownloadImageView()
        {
            return PartialView();
        }
    }
}