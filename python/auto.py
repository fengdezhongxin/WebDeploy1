# coding=utf-8
from pywinauto import application
from pywinauto import controls
import os , sys
import chardet
import re
import shutil
import time
import pywinauto

reload(sys)
sys.setdefaultencoding('utf-8')


######################################
# Global Variant
#  define
#  {
#      mobile_svn_root :
#      dest_dir        :
#      src_dir         : 
#      conf_file       :
#      app_path        :
#      winrar_path     :
#      winrar_BAT      :
#      enc_root        :
#      g_hint          :
#      g_all           :
#      delay_close     :
#  }
######################################
g_arg_obj = {}

arg_file        = "app.conf"

def parseArg():
    arg_f = open(arg_file)
    inner_dic = {}

    for line in arg_f:
        line = line.strip()
        m = re.match(r"^\#" , line)
        if m == None:
            #print line
            inner_obj = line.split("=")
            keys = inner_obj[0].strip()
            values = inner_obj[1].strip()
            inner_dic[keys] = values 

    return inner_dic

def getLatestRarPath():
    dest_dir = getArg('dest_dir' , g_arg_obj)
    obj = dest_dir.split("\/")
    new_str = ""
    for i in range ( len(obj)-2 ):
        new_str += obj[i]
        new_str += "\/"
    
    new_str += obj[len(obj)-1]
    new_str += ".rar"
    return new_str    
    
def genbat():
    rar_obj = re.findall( r'(\w)\:(.+?$)' , getArg('winrar_path',g_arg_obj))
    output = open(getArg('winrar_BAT', g_arg_obj) , "w+")
    output.write(rar_obj[0][0] + ':' + '\n')
    output.write("cd " + rar_obj[0][1] + '\n')
    dest = getArg('dest_dir' , g_arg_obj)
    output.write("winrar a -r  -ep1 " + dest + " " + dest)
    output.close()    

def check(items):
    matchObj = re.findall( r'(?<=\\)(.+?)\.d$' , items)
    name_str = ""
    if matchObj:
        name_str = matchObj[0]
    return name_str+".d"

def getEncPath(item):
    svn_root = getArg('mobile_svn_root' , g_arg_obj)
    part = enc_root.replace(svn_root , '')
    reobj = re.compile('\/')
    result = reobj.sub('\\\\', part)
    res = item.replace(result , '')

def scan_enc_file_list(source , prefix , dest_dir):
    conf_fd = getArg('conf_file' , g_arg_obj)
    conf_arr = readConf(conf_fd)
    codedetect = chardet.detect(source)["encoding"]
    source = unicode(source, codedetect)
    source.encode("utf-8")

    codedetect = chardet.detect(prefix)["encoding"]
    prefix = unicode(prefix, codedetect)
    prefix.encode("utf-8")

    for root,dirs,files in os.walk(source):
        for file in files:        
            item = os.path.join(root,file)
            cmp_item = item.replace(prefix , '')
            svn_root = getArg('mobile_svn_root' , g_arg_obj)
            enc_root = getArg('enc_root' , g_arg_obj)
            cmp_item = enc_root.replace(svn_root , '') + cmp_item
            
            print cmp_item
            
            if checkInConf(cmp_item , conf_arr) == True:
                
                inner = item.replace(prefix , '')
                path_arr = inner.split('\\')

                rel_path = getRelativePath(dest_dir)
                for each_p in path_arr:
                    if each_p != path_arr[len(path_arr) - 1]:
                        rel_path = rel_path + each_p + '/'

                if os.path.exists(rel_path) == False:
                    os.makedirs(rel_path)
                print item , rel_path    
                shutil.copy(item , rel_path)

def copyAll(from_files , to_files):
    codedetect = chardet.detect(from_files)["encoding"]
    source = unicode(from_files, codedetect)
    source.encode("utf-8")
    
    shutil.copytree(source , getRelativePath(to_files)) 

    enc_path = getArg('enc_root' , g_arg_obj)
    svn_root = getArg('mobile_svn_root' , g_arg_obj)
    rec_log(enc_path , svn_root)

def rec_log(scan_source , source_root):
    dest = getArg('dest_dir' , g_arg_obj)
    if os.path.exists(dest + '/releaselog') == False :
        os.makedirs(dest + '/releaselog')
    
    hint = getArg('g_hint' , g_arg_obj)    
    dest = getArg('dest_dir' , g_arg_obj)
    output = open(dest + '/releaselog/zxcftupgrade_'+time.strftime('%Y%m%d%H%M%S',time.localtime(time.time())) +'_'+ hint.encode('gbk') +'.txt', 'w+')
    for root,dirs,files in os.walk(scan_source):
        for file in files:        
            item = os.path.join(root,file)
            output.write(item + '\n')
    output.close()    

    
def readConf(conf_f):
    conf_obj = open(conf_f)
    a = []
    for line in conf_obj:
        line = line.strip()
        if line != '':
            a.append(line)
    return a

def getRelativePath(dest):
    #get package path
    svn_root = getArg('mobile_svn_root' , g_arg_obj)
    enc_root = getArg('enc_root' , g_arg_obj)
    return dest + enc_root.replace(svn_root , '') 

def checkInConf(str , conf_arr):
    reobj = re.compile('\/')
    str = reobj.sub('\\\\', str)

    prefix = getArg('mobile_svn_root' , g_arg_obj)
    
    for each_i in conf_arr:
        result = reobj.sub('\\\\', each_i)
        item = prefix + result
        
        if os.path.isdir(item):
            rex = re.compile('\\\\')
            sp_result = rex.sub(' ', result)
            sp_str = rex.sub(' ', str)
            
            p = re.compile(sp_result)
            a = p.findall(sp_str)
            
            if len(a) != 0:
                return True            
        else:
            test = re.compile('zjfund')
            t_a = test.findall(result)
            t_b = test.findall(str)
            if len(t_a)!=0 and len(t_b)!=0:
                print  result + ' ' + str
            result = result + ".d"
            if result == str:
                print result + ' ' + str
                return True
    return False        
    
def copyPartial(src_dir , dest_dir):
    scan_enc_file_list(src_dir , src_dir , dest_dir)
    rec_Partial_log()
    
    
def rec_Partial_log():
    dest = getArg('dest_dir' , g_arg_obj)
    if os.path.exists(dest + '/releaselog') == False :
        os.makedirs(dest + '/releaselog')
    
    hint = getArg('g_hint' , g_arg_obj)    
    output = open(dest + '/releaselog/zxcftupgrade_'+time.strftime('%Y%m%d%H%M%S',time.localtime(time.time())) +'_' + hint.encode('gbk') + '.txt', 'w+')

    conf_fd = getArg('conf_file' , g_arg_obj)    
    conf_obj = open(conf_fd)
    for line in conf_obj:
        line = line.strip()
        if line != '':
            output.write(line + '\n')
    
    output.close()        

def cleanTargetPath(dir , flag):
    codedetect = chardet.detect(dir)["encoding"]
    dir = unicode(dir, codedetect)
    dir.encode("utf-8")

    if os.path.isdir( dir ):
        paths = os.listdir(dir)
        for path in paths:
            filePath = os.path.join( dir, path )
            if os.path.isfile( filePath ):
                try:
                    os.remove( filePath )
                except os.error:
                    autoRun.exception( "remove %s error." %filePath )
            elif os.path.isdir( filePath ):
                if filePath[-4:].lower() == ".svn".lower():
                    continue
                shutil.rmtree(filePath,True)
    
        if flag == 1:
            os.rmdir(dir)    
    
    return True

def getArg(arg_name ,dic_obj):
    val = dic_obj[arg_name].replace('\"','')
    val = val.replace('\'' , '')
    
    val = os.path.normcase(val)

    return val
    
def prepare():
    cleanTargetPath(getArg('src_dir' , g_arg_obj) , 0)
    cleanTargetPath(getArg('dest_dir' , g_arg_obj) , 1)
      
    lastest_rar = getLatestRarPath()  
    if os.path.isfile( lastest_rar ):
        os.remove(lastest_rar)    
    
    rar_bat = getArg('winrar_BAT' , g_arg_obj)  
    if os.path.exists(rar_bat) == False:
        genbat()

def startTool():
    app = application.Application()
    app_path = getArg('app_path' , g_arg_obj)
    app.start_(app_path)
    engine_win = app.window_(class_name="TWebModule1")
    #engine_win.print_control_identifiers()
    tab = controls.common_controls.TabControlWrapper(engine_win.TPageControl)
    #print tab.TabCount()
    tab.Select(2)
    edit = controls.win32_controls.EditWrapper(engine_win.TDirectoryEdit)
    #edit.SetEditText("D:/code/web/trunk/zlcftajax/ttf/fkxqsgb")
    enc_path = getArg('enc_root' , g_arg_obj)
    edit.SetEditText(enc_path)
    enc_btn = controls.win32_controls.ButtonWrapper(engine_win.TBitBtn3)
    enc_btn.Click()
    enc_btn.Click()
    enc_btn.Click()
    try:
        sure_engine_win = app.window_(class_name="#32770")
        sure_engine_btn = controls.win32_controls.ButtonWrapper(sure_engine_win.Button1)
        sure_engine_btn.Click()
    except pywinauto.findwindows.WindowNotFoundError:
        print ' '
    try:
        sure_win = app.window_(class_name="TMessageForm")
        sure_btn = controls.win32_controls.ButtonWrapper(sure_win.Button)
        sure_btn.Click()
    except pywinauto.findwindows.WindowNotFoundError:
        print ' '    
        
    delay_close = getArg('delay_close' , g_arg_obj)    
    f_delay=float(delay_close)
    #print f_delay
    time.sleep(f_delay)
    app.Kill_()
    

def package():
    src = getArg('src_dir' , g_arg_obj)
    dest = getArg('dest_dir' , g_arg_obj)
    rar_bat = getArg('winrar_BAT' , g_arg_obj)

    all_fg = getArg('g_all' , g_arg_obj)
    
    if int(all_fg) == 0:
        copyPartial(src , dest)
    else:    
        copyAll(src , dest)
    
    #os.system(rar_bat)

def test():
    print g_arg_obj['src_dir']

# main 
g_arg_obj = parseArg()       
prepare()
startTool()
package()
        
        