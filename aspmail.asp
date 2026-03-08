<meta charset="utf-8">
<%
On Error Resume Next

' =====================
' FORM VERİLERİ
' =====================
Dim Message, Doldur
Message = "Yeni İletişim Formu Mesajı" & vbCrLf & vbCrLf

For Each Doldur In Request.Form
  Message = Message & Doldur & ": " & Request.Form(Doldur) & vbCrLf
Next

' =====================
' MAIL GÖNDERİMİ
' =====================
Set Mail = Server.CreateObject("Persits.MailSender")
Mail.Host = "mail.findbring.com"
Mail.Username = "info@findbring.com"
Mail.Password = "Elmas.2004"
Mail.Port = 587

Mail.From = "admin@findbring.com"
Mail.FromName = "BulalGetir Web Form"
Mail.AddAddress "info@findbring.com"
Mail.AddReplyTo Request.Form("Mail_Adresi")
Mail.Subject = "İletişim Formu: " & Request.Form("Konu")
Mail.Body = Message

Mail.Send

' =====================
' SONUÇ
' =====================
If Err.Number <> 0 Then
  Response.Write "Hata oluştu: " & Err.Description
Else
  Response.Redirect("/tesekkur/")
End If
%>
